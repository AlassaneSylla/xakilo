from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(SimpleHistoryAdmin):
    list_display = [
        'id', 'username', 'email', 'first_name', 'last_name', 
        'last_login', 'is_staff', 'is_superuser'
    ]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    history_list_display = ['history_date', 'history_user', 'history_change_reason']
