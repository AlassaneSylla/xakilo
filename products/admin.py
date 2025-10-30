from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import Product


@admin.register(Product)
class ProductAdmin(SimpleHistoryAdmin):
    list_display = [
        'id', 'product_name', 'category', 'product_ref', 'purchase_price',
        'stock', 'unit_price', 'alert'
    ]
    search_fields = ['id', 'product_name', 'product_ref']
    history_list_display = ['history_date', 'history_user', 'history_change_reason']

