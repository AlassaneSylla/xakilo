from django.utils import timezone
from stock.models.removal import Removal, RemovalItem


def create_removal_with_items(user, removal_data, items_data):
    removal = Removal.objects.create(created_by=user, **removal_data)

    total_amount = 0
    for item_data in items_data:
        product = item_data.get('product')
        quantity = item_data.get('quantity')
        unit_price = product.unit_price if product else 0
        RemovalItem.objects.create(
            removal=removal,
            product=product,
            quantity=quantity,
            unit_price=unit_price
        )
        total_amount += unit_price * quantity

    # Facture only if 'vente'
    if removal.destination == 'vente':
        removal.invoice_total_amount = total_amount
        removal.invoice_status = removal.invoice_status
        removal.invoice_date_created = removal.invoice_date_created or timezone.now()
        removal.save()

    return removal
