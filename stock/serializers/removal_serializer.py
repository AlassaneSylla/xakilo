from rest_framework import serializers
from stock.models.removal import Removal, RemovalItem


class RemovalItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    total_price = serializers.SerializerMethodField()
    unit_price = serializers.IntegerField()  # ✅ prix en CFA = entier

    class Meta:
        model = RemovalItem
        fields = ['product_name', 'quantity', 'unit_price', 'total_price']

    def get_total_price(self, obj):
        return int(obj.quantity * obj.unit_price) if obj.unit_price else 0


class RemovalSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    invoice = serializers.SerializerMethodField()

    class Meta:
        model = Removal
        fields = [
            'id',
            'client_name',
            'destination',
            'created_by_username',
            'invoice'
        ]

    def get_invoice(self, obj):
        # Si ce n’est pas une vente → pas de facture
        if obj.destination != 'vente':
            return None

        # Liste des produits
        products = RemovalItemSerializer(obj.items.all(), many=True).data

        # Calcul automatique du total si la base ne l’a pas encore
        total = sum(p['total_price'] for p in products)
        total_amount = int(obj.invoice_total_amount or total)

        # Retour du bloc facture complet
        return {
            "invoice_number": obj.invoice_number,
            "total_amount": total_amount,
            "status": obj.invoice_status,
            "date_created": obj.invoice_date_created,
            "products": products
        }
