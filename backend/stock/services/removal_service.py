from django.utils import timezone
from django.db import transaction
from stock.models.removal import Removal, RemovalItem
from products.models import Product


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

    # Création du removal principal
    removal = Removal.objects.create(created_by=user, **removal_data)
    total_amount = 0

    for item_data in items_data:
        product_id = item_data.get('product')
        quantity = item_data.get('quantity', 0)

        product = Product.objects.filter(id=product_id).first()
        if not product:
            raise ValueError(f"Produit avec ID {product_id} introuvable")

        if product.stock < quantity:
            raise ValueError(f"Stock insuffisant pour {product.product_name}")

        # Créer le RemovalItem
        RemovalItem.objects.create(
            removal=removal,
            product=product,
            quantity=quantity,
            unit_price=product.unit_price
        )

        # Décrémenter le stock
        product.stock -= quantity
        product.save()

        total_amount += quantity * product.unit_price

    # Mise à jour facture si vente
    if destination == 'vente':
        removal.invoice_total_amount = total_amount
        removal.invoice_date_created = timezone.now()
        removal.save(update_fields=['invoice_total_amount', 'invoice_date_created'])

    return removal


@transaction.atomic
def update_removal_status(removal, new_status):
    """
    Met à jour le statut d'une facture ou d'une sortie.
    Si la facture est annulée, le stock est restauré.
    """
    if removal.invoice_status in ['payee', 'annulee']:
        raise ValueError("Impossible de modifier une facture déjà payée ou annulée.")

    if new_status == 'payee':
        removal.invoice_status = 'payee'
        removal.invoice_date_created = removal.invoice_date_created or timezone.now()

    elif new_status == 'annulee':
        removal.invoice_status = 'annulee'
        for item in removal.items.all():
            product = item.product
            if product:
                product.stock += item.quantity
                product.save()

    removal.save(update_fields=['invoice_status', 'invoice_date_created'])
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



