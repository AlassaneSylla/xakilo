from django.db import models


class Payment(models.Model):
    MODE_CHOICES = [
        ('especes',      'Espèces'),
        ('mobile_money', 'Mobile Money'),
        ('carte',        'Carte Bancaire'),
    ]

    removal = models.ForeignKey(
        'stock.Removal',
        on_delete=models.CASCADE,
        related_name='payments',
    )
    amount = models.IntegerField()
    date   = models.DateTimeField(auto_now_add=True)
    mode   = models.CharField(max_length=20, choices=MODE_CHOICES)
    received_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments_received',
    )
    note = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table  = 'payments'
        ordering  = ['date']

    def __str__(self):
        return f"{self.removal.removal_ref} – {self.amount} FCFA ({self.mode})"