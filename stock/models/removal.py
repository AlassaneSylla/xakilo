from simple_history.models import HistoricalRecords
from django.utils import timezone
from django.db import models


class Removal(models.Model):
    DESTINATION_CHOICES = [
        ('vente', 'Vente'),
        ('don', 'Don'),
        ('perte', 'Perte'),
    ]
    STATUS_CHOICES = [
        ('payee', 'Payée'),
        ('en_attente', 'En attente'),
        ('annulee', 'Annulée'),
    ]

    date_register = models.DateTimeField(auto_now_add=True)
    client_name = models.CharField(max_length=100, blank=True, null=True)
    destination = models.CharField(max_length=20, choices=DESTINATION_CHOICES)
    removal_ref = models.CharField(max_length=30, unique=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removals_created'
    )

    # pour la facturation
    invoice_number = models.CharField(max_length=30, blank=True, null=True)
    invoice_total_amount = models.IntegerField(blank=True, null=True)
    invoice_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    invoice_date_created = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'removals'

    def save(self, *args, **kwargs):
        is_new = self.pk is None  

        super().save(*args, **kwargs)  

        if is_new and not self.removal_ref:
            today = timezone.now().strftime("%Y%m%d")
            last_id = Removal.objects.count()
            self.removal_ref = f"REM-{today}-{last_id:04d}"

        if self.destination == 'vente' and not self.invoice_number:
            count = Removal.objects.filter(destination='vente').count()
            year = timezone.now().year
            self.invoice_number = f"FAC-{year}-{count:04d}"
            self.invoice_date_created = timezone.now()

        # calcule du total
        if self.destination == 'vente' and self.items.exists(): 
            total = sum(item.total_price for item in self.items.all()) 
            self.invoice_total_amount = total

        # enregistrer a nouveau les data
        super().save(update_fields=[
            'removal_ref', 'invoice_number', 'invoice_date_created', 'invoice_total_amount'
        ])

    #- historique des sorties 
    history = HistoricalRecords()


class RemovalItem(models.Model):
    removal = models.ForeignKey(Removal, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.IntegerField(null=True, blank=True)
    removal = models.ForeignKey(Removal, related_name='items', on_delete=models.CASCADE)

    class Meta:
        db_table = 'removal_items'

    def save(self, *args, **kwargs):
        if not self.unit_price and self.product:
            self.unit_price = self.product.unit_price
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.unit_price * self.quantity if self.unit_price else 0
