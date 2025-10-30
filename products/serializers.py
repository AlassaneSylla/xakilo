from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'product_name',
            'category',          
            'category_display',  
            'product_ref',
            'stock',
            'unit_price',
            'purchase_price',
            'alert'
        ]
        read_only_fields = ['product_ref']
