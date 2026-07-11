from simple_history.models import HistoricalRecords
from django.utils import timezone
from django.db import models


class Entry(models.Model):
    product = models.ForeignKey(
        'products.Product', 
        db_column='product_id', 
        on_delete=models.SET_NULL,
        blank=True, 
        null=True, 
        related_name= 'entries'
    )
    date_register = models.DateTimeField(auto_now_add=True)
    quantity = models.IntegerField()
    supplier = models.CharField(max_length=100, blank=True, null=True)
    entry_reference = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    boutique = models.ForeignKey(
        'accounts.Boutique',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='entries',
    )
    created_by = models.ForeignKey(
        'accounts.User',
        db_column='created_by_id',
        blank=True,
        on_delete=models.SET_NULL,
        null=True,
        related_name= 'entries_created'
    )
    cash_session = models.ForeignKey(
        'stock.CashSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entries',
    )

    class Meta:
        managed = True
        db_table = 'entries'
        indexes = [
            models.Index(fields=['boutique', 'date_register']),
            models.Index(fields=['product', 'date_register']),
        ]

    def save(self, *args, **kwargs):
        if not self.entry_reference:
            super().save(*args, **kwargs)
            year = timezone.now().year
            self.entry_reference = f"ENT-{year}-{self.id:04d}"
            Entry.objects.filter(pk=self.pk).update(entry_reference=self.entry_reference)
            return
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.entry_reference} - {self.product}"
    
    # historique des enregistrements
    history = HistoricalRecords()
