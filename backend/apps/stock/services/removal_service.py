from django.utils import timezone
from django.db import transaction
from django.db.models import F
from apps.stock.models.removal import Removal, RemovalItem
from apps.products.models import Product


@transaction.atomic
def create_removal_with_items(user, removal_data, items_data):
    """
    Crée un Removal et ses RemovalItems associés.
    Gère la décrémentation du stock et la création de facture.
    """
    destination = removal_data.get('destination')
    if destination not in ['vente', 'don', 'perte']:
        raise ValueError("Destination invalide")

    if not items_data:
        raise ValueError("Aucun produit fourni")

    # Préfetch de tous les produits en 1 seule query (évite le N+1)
    product_ids = [int(item.get('product')) for item in items_data if item.get('product')]
    products_map = {p.id: p for p in Product.objects.filter(id__in=product_ids)}

    removal = Removal.objects.create(created_by=user, **removal_data)
    total_amount = 0
    items_to_create = []

    for item_data in items_data:
        product_id = int(item_data.get('product'))
        quantity   = item_data.get('quantity', 0)

        product = products_map.get(product_id)
        if not product:
            raise ValueError(f"Produit avec ID {product_id} introuvable")

        # Décrémentation atomique : évite le TOCTOU sous charge concurrente
        updated = Product.objects.filter(id=product_id, stock__gte=quantity).update(
            stock=F('stock') - quantity
        )
        if updated == 0:
            raise ValueError(f"Stock insuffisant pour {product.product_name}")

        items_to_create.append(RemovalItem(
            removal=removal,
            product=product,
            quantity=quantity,
            unit_price=product.unit_price,
            purchase_price=product.purchase_price,
        ))
        total_amount += quantity * (product.unit_price or 0)

    # 1 INSERT pour tous les items au lieu de N INSERTs individuels
    RemovalItem.objects.bulk_create(items_to_create)

    if destination == 'vente':
        removal.invoice_total_amount = total_amount
        removal.invoice_date_created = timezone.now()
        removal.save(update_fields=['invoice_total_amount', 'invoice_date_created'])

    return removal


@transaction.atomic
def update_removal_status(removal, new_status, cancelled_by=None, cancellation_reason=''):
    """
    Met à jour le statut d'une sortie.
    L'annulation restaure le stock et est irréversible.
    """
    if removal.invoice_status == 'annulee':
        raise ValueError("Cette sortie est déjà annulée.")

    if new_status == 'payee':
        if removal.invoice_status == 'payee':
            raise ValueError("Cette facture est déjà marquée comme payée.")
        removal.invoice_status = 'payee'
        removal.invoice_date_created = removal.invoice_date_created or timezone.now()
        removal.save(update_fields=['invoice_status', 'invoice_date_created'])

    elif new_status == 'annulee':
        removal.invoice_status     = 'annulee'
        removal.cancelled_at       = timezone.now()
        removal.cancelled_by       = cancelled_by
        removal.cancellation_reason = cancellation_reason or ''
        # Restauration du stock pour tous les articles
        for item in removal.items.select_related('product').all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=['stock'])
        removal.save(update_fields=[
            'invoice_status', 'cancelled_at', 'cancelled_by', 'cancellation_reason',
        ])

    return removal


@transaction.atomic
def delete_removal_and_restore_stock(removal):
    """
    Supprime un removal et restaure le stock des produits concernés.
    """
    for item in removal.items.all():
        product = item.product
        if product:
            product.stock += item.quantity
            product.save()
    removal.delete()



