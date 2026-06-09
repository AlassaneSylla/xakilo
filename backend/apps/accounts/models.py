from simple_history.models import HistoricalRecords
from django.contrib.auth.models import AbstractUser
from django.db import models


class Boutique(models.Model):
    name    = models.CharField(max_length=100)
    phone   = models.CharField(max_length=20,  blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    email   = models.EmailField(blank=True, null=True)
    logo    = models.FileField(upload_to='boutique_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active  = models.BooleanField(default=True)

    class Meta:
        db_table   = 'boutiques'
        verbose_name = 'Boutique'

    def __str__(self):
        return self.name

    @property
    def owner(self):
        return self.users.filter(role='OWNER').first()


class User(AbstractUser):
    ROLE_CHOICES = [
        ('OWNER',    'Proprietaire'),
        ('MANAGER',  'Manager'),
        ('EMPLOYEE', 'Employe'),
    ]

    boutique = models.ForeignKey(
        Boutique,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='users',
    )
    role    = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')
    phone   = models.CharField(max_length=20,  blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table     = 'users'
        verbose_name = 'Utilisateur'

    history = HistoricalRecords()
