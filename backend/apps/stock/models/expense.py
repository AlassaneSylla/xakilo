from django.db import models


class Expense(models.Model):
    MODE_CHOICES = [
        ('especes',      'Espèces'),
        ('mobile_money', 'Mobile Money'),
    ]

    cash_session  = models.ForeignKey(
        'stock.CashSession',
        on_delete=models.CASCADE,
        related_name='expenses',
        null=True,
        blank=True,
    )
    declared_by   = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses_declared',
    )
    boutique      = models.ForeignKey(
        'accounts.Boutique',
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses',
    )
    amount        = models.IntegerField()
    description   = models.CharField(max_length=200)
    payment_mode  = models.CharField(max_length=20, choices=MODE_CHOICES, default='especes')
    date_register = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expenses'

    def __str__(self):
        return f"{self.description} – {self.amount} FCFA"