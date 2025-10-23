from rest_framework import serializers
from .models import InvoiceCancellationLog, Invoice, InvoiceItems


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice 
        fields = '__all__'

class InvoiceItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItems
        fields = '__all__'

class InvoiceCancellationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceCancellationLog
        fields = '__all__'