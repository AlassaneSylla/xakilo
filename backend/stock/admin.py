from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models.removal import Removal, RemovalItem
from .models.entry import Entry

@admin.register(Removal)
class RemovalAdmin(SimpleHistoryAdmin):
    list_display = ['id', 'client_name', 'destination', 'invoice_status', 'invoice_total_amount']
    search_fields = ('removal_ref', 'client_name')
    history_list_display = ['history_date', 'history_user', 'history_change_reason']


@admin.register(RemovalItem)
class RemovalItemAdmin(admin.ModelAdmin):
    list_display = ('removal', 'product', 'quantity', 'unit_price')


@admin.register(Entry)
class EntryAdmin(SimpleHistoryAdmin):
    list_display = [
        'id', 'product', 'date_register', 'quantity', 
        'supplier', 'entry_reference', 'created_by'
    ]
    search_fields = ['entry_reference', 'product']
    history_list_display = ['history_date', 'history_user', 'history_change_reason']



