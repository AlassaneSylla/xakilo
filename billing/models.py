from django.db import models


class Invoice(models.Model):
    invoice_number = models.CharField(unique=True, max_length=50)
    date_invoice = models.DateField(auto_now_add=True)
    client_name = models.CharField(max_length=100, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    payment_status = models.CharField(
        max_length=20, 
        default= 'En attente',
        choices=[
            ('Payée', 'Payée'),
            ('En attente', 'En attente'),
            ('Annulée', 'Annulée'),
        ]
    )
    cancel_reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'invoices'


class InvoiceItems(models.Model):
    invoice = models.ForeignKey('Invoice', models.DO_NOTHING, blank=True, null=True)
    product = models.ForeignKey('products.Product', models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False 
        db_table = 'invoice_items'


class InvoiceCancellationLog(models.Model):
    invoice = models.ForeignKey('Invoice', on_delete=models.CASCADE, related_name='cancellations')
    cancelled_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True, null=True)
    cancelled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Annulation de {self.invoice.invoivce_number} par {self.cancelled_by.username if self.cancelled_by else 'inconnu'}"
