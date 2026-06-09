from django.db import models
from django.db.models import Q, UniqueConstraint


class CashSession(models.Model):
    STATUS_CHOICES = [
        ('open',   'Ouverte'),
        ('closed', 'Clôturée'),
    ]

    boutique        = models.ForeignKey(
        'accounts.Boutique',
        on_delete=models.CASCADE,
        related_name='cash_sessions',
    )
    opened_by       = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='sessions_opened',
    )
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    start_time      = models.DateTimeField(auto_now_add=True)
    end_time        = models.DateTimeField(null=True, blank=True)
    opening_balance = models.IntegerField(default=0)
    closing_balance = models.IntegerField(null=True, blank=True)
    expected_balance= models.IntegerField(null=True, blank=True)
    # gap = closing_balance - expected_balance, visible propriétaire uniquement

    class Meta:
        db_table = 'cash_sessions'
        constraints = [
            UniqueConstraint(
                fields=['boutique'],
                condition=Q(status='open'),
                name='one_open_session_per_boutique',
            )
        ]

    def compute_expected_balance(self):
        from apps.stock.models.payment import Payment
        from apps.stock.models.expense import Expense
        cash_in  = Payment.objects.filter(
            removal__cash_session=self, mode='especes'
        ).aggregate(t=models.Sum('amount'))['t'] or 0
        cash_out = Expense.objects.filter(
            cash_session=self, payment_mode='especes'
        ).aggregate(t=models.Sum('amount'))['t'] or 0
        return self.opening_balance + cash_in - cash_out

    def __str__(self):
        return f"Session {self.pk} – {self.boutique} ({self.status})"