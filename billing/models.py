from datetime import timezone
from django.db import models


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=30, unique=True, blank=True)
    date_issued = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices_created'
    )

    class Meta:
        db_table = 'invoices'

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            year = timezone.now().year
            count = Invoice.objects.filter(date_issued__year=year).count() + 1
            self.invoice_number = f"FAC-{year}-{count:04d}"
        super().save(*args, **kwargs)
