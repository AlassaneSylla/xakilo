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
        ('en_attente',          'En attente'),
        ('partiellement_payee', 'Partiellement payée'),
        ('payee',               'Payée'),
        ('annulee',             'Annulée'),
    ]

    date_register = models.DateTimeField(auto_now_add=True)
    client_name  = models.CharField(max_length=100, blank=True, null=True)
    client_phone = models.CharField(max_length=20,  blank=True, null=True)
    destination = models.CharField(max_length=20, choices=DESTINATION_CHOICES)
    removal_ref = models.CharField(max_length=30, unique=True)
    boutique = models.ForeignKey(
        'accounts.Boutique',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='removals',
    )
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removals_created'
    )

    cash_session = models.ForeignKey(
        'stock.CashSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removals',
    )

    # champs anti-fraude pour destination='perte'
    justification = models.TextField(blank=True, null=True)
    proof_image   = models.ImageField(upload_to='loss_proofs/', blank=True, null=True)

    # champs d'annulation
    cancelled_at         = models.DateTimeField(blank=True, null=True)
    cancelled_by         = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='removals_cancelled',
    )
    cancellation_reason  = models.TextField(blank=True, null=True)

    # pour la facturation
    invoice_number = models.CharField(max_length=30, blank=True, null=True)
    invoice_total_amount = models.IntegerField(blank=True, null=True)
    invoice_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    invoice_date_created = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'removals'
        indexes = [
            models.Index(fields=['boutique', 'date_register']),
            models.Index(fields=['boutique', 'destination']),
            models.Index(fields=['boutique', 'destination', 'date_register']),
        ]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            fields = []
            if not self.removal_ref:
                today = timezone.now().strftime("%Y%m%d")
                self.removal_ref = f"REM-{today}-{self.pk:04d}"
                fields.append('removal_ref')
            if self.destination == 'vente' and not self.invoice_number:
                self.invoice_number = f"FAC-{timezone.now().year}-{self.pk:04d}"
                self.invoice_date_created = timezone.now()
                fields.extend(['invoice_number', 'invoice_date_created'])
            if fields:
                super().save(update_fields=fields)

    @property
    def amount_paid(self):
        return sum(p.amount for p in self.payments.all())

    @property
    def balance_due(self):
        total = self.invoice_total_amount or 0
        return max(0, total - self.amount_paid)

    history = HistoricalRecords()


class RemovalItem(models.Model):
    removal = models.ForeignKey(Removal, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.IntegerField(null=True, blank=True)
    purchase_price = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'removal_items'

    def save(self, *args, **kwargs):
        if not self.unit_price and self.product:
            self.unit_price = self.product.unit_price
        if not self.purchase_price and self.product:
            self.purchase_price = self.product.purchase_price
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.unit_price * self.quantity if self.unit_price else 0
