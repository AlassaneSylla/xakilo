from simple_history.models import HistoricalRecords
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'

    # historique changement
    history = HistoricalRecords() 
