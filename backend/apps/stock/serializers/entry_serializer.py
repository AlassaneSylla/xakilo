from rest_framework import serializers
from apps.stock.models.entry import Entry


class EntrySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_reference = serializers.CharField(source='product.product_reference', read_only=True)
    created_by = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Entry
        fields = '__all__'
        read_only_fields= ['created_by', 'entry_reference', 'date_register']
