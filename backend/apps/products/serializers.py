from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    category_display    = serializers.CharField(source='get_category_display', read_only=True)
    stock               = serializers.IntegerField(read_only=True)
    last_supplier       = serializers.SerializerMethodField()
    last_entry_date     = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = '__all__'
        read_only_fields = ['product_ref', 'stock', 'created_by_username']

    def get_last_supplier(self, obj):
        if hasattr(obj, '_last_supplier'):
            return obj._last_supplier
        e = obj.entries.order_by('-date_register').first()
        return e.supplier if e else None

    def get_last_entry_date(self, obj):
        if hasattr(obj, '_last_entry_date'):
            dt = obj._last_entry_date
            return dt.isoformat() if dt else None
        e = obj.entries.order_by('-date_register').first()
        return e.date_register.isoformat() if e else None
