from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_ROLES = [('admin', 'Admin'), ('user', 'User')]
    
    user_role = models.CharField(max_length=50, choices=USER_ROLES, default='user')
  
    class Meta:
        db_table = 'users'
