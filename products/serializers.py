from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    stock = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'product_name', 'category', 'category_display', 'product_ref',
            'stock', 'unit_price', 'purchase_price', 'alert', 'created_by_username'
        ]
        read_only_fields = ['product_ref', 'stock', 'created_by_username']
