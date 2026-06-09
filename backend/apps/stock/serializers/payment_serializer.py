from rest_framework import serializers
from apps.stock.models.payment import Payment


class PaymentSerializer(serializers.ModelSerializer):
    received_by_username = serializers.CharField(
        source='received_by.username', read_only=True
    )
    mode_display = serializers.CharField(source='get_mode_display', read_only=True)

    class Meta:
        model  = Payment
        fields = [
            'id', 'amount', 'date', 'mode', 'mode_display',
            'received_by', 'received_by_username', 'note',
        ]
        read_only_fields = ['date', 'received_by', 'received_by_username', 'mode_display']