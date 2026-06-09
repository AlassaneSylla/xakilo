from rest_framework import serializers
from apps.stock.models.removal import Removal, RemovalItem
from apps.stock.serializers.payment_serializer import PaymentSerializer


class RemovalItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    total_price  = serializers.SerializerMethodField()
    unit_price   = serializers.IntegerField()

    class Meta:
        model  = RemovalItem
        fields = ['product_name', 'quantity', 'unit_price', 'total_price']

    def get_total_price(self, obj):
        return int(obj.quantity * obj.unit_price) if obj.unit_price else 0


class RemovalSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    invoice             = serializers.SerializerMethodField()
    products_label      = serializers.SerializerMethodField()
    payments            = PaymentSerializer(many=True, read_only=True)
    amount_paid         = serializers.SerializerMethodField()
    balance_due         = serializers.SerializerMethodField()

    class Meta:
        model  = Removal
        fields = [
            'id', 'date_register', 'client_name', 'client_phone', 'destination',
            'removal_ref', 'invoice_status', 'created_by_username',
            'invoice', 'products_label', 'payments', 'amount_paid', 'balance_due',
            'justification', 'proof_image',
        ]
        read_only_fields = ['date_register', 'removal_ref']

    def validate(self, attrs):
        destination = attrs.get('destination') or (self.instance.destination if self.instance else None)
        if destination == 'perte' and not attrs.get('justification', '').strip():
            raise serializers.ValidationError({'justification': 'Ce champ est obligatoire pour une perte.'})
        return attrs

    def get_products_label(self, obj):
        names = [item.product.product_name for item in obj.items.all() if item.product]
        if not names:
            return None
        if len(names) == 1:
            return names[0]
        return f"{names[0]} (+{len(names) - 1} article{'s' if len(names) > 2 else ''})"

    def get_amount_paid(self, obj):
        return sum(p.amount for p in obj.payments.all())

    def get_balance_due(self, obj):
        total = obj.invoice_total_amount or 0
        return max(0, total - self.get_amount_paid(obj))

    def get_invoice(self, obj):
        if obj.destination != 'vente':
            return None
        products     = RemovalItemSerializer(obj.items.all(), many=True).data
        total        = sum(p['total_price'] for p in products)
        total_amount = int(obj.invoice_total_amount or total)
        amount_paid  = self.get_amount_paid(obj)
        return {
            'invoice_number': obj.invoice_number,
            'total_amount':   total_amount,
            'amount_paid':    amount_paid,
            'balance_due':    max(0, total_amount - amount_paid),
            'status':         obj.invoice_status,
            'date_created':   obj.invoice_date_created,
            'products':       products,
        }