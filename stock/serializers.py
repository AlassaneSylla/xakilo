from rest_framework import serializers

from billing.serializers import InvoiceSerializer, Invoice
from .models import Entry, Removal, RemovalItem


class EntrySerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField(source='product.product_name', read_only=True)
    product_reference = serializers.SerializerMethodField(source='product.product_reference', read_only=True)
    created_by = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Entry
        fields = [ 'id', 'product_id', 'product_name', 'product_reference', 'date_register', 'quantity', 'supplier', 'reference','category'  'created_by' ]
        read_only_fields= ['created_by', 'reference', 'date_register']


class RemovalItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = RemovalItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']


class RemovalSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    items = RemovalItemSerializer(many=True)
    invoice = InvoiceSerializer(read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)

    class Meta:
        model = Removal
        fields = [ 'id', 'reference', 'date_register', 'destination', 'product', 'product_name', 'quantity', 'client_name', 'created_by', 'created_by_username', 'invoice', 'items' ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        removal = Removal.objects.create(**validated_data)

        total_amount = 0
        for item_data in items_data:
            product = item_data.get('product')
            quantity = item_data.get('quantity')
            removal_item = RemovalItem.objects.create(
                removal=removal,
                product=product,
                quantity=quantity,
                unit_price=product.unit_price if product else 0
            )
            total_amount += removal_item.total_price

        if removal.destination == 'vente':
            invoice_number = f"INV-{removal.reference}"
            invoice = Invoice.objects.create(
                invoice_number=invoice_number,
                total_amount=total_amount,
                created_by=removal.created_by
            )
            removal.invoice = invoice
            removal.save()

        return removal

