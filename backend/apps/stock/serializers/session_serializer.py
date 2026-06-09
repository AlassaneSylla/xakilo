from rest_framework import serializers
from apps.stock.models.session import CashSession
from apps.stock.models.expense import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    declared_by_username = serializers.CharField(source='declared_by.username', read_only=True)

    class Meta:
        model  = Expense
        fields = ['id', 'amount', 'description', 'payment_mode', 'date_register', 'declared_by_username']
        read_only_fields = ['date_register']


class CashSessionSerializer(serializers.ModelSerializer):
    opened_by_username = serializers.CharField(source='opened_by.username', read_only=True)
    gap                = serializers.SerializerMethodField()
    expenses           = ExpenseSerializer(many=True, read_only=True)

    class Meta:
        model  = CashSession
        fields = [
            'id', 'status', 'start_time', 'end_time',
            'opening_balance', 'closing_balance', 'expected_balance',
            'opened_by_username', 'gap', 'expenses',
        ]
        read_only_fields = ['status', 'start_time', 'end_time', 'expected_balance']

    def get_gap(self, obj):
        if obj.closing_balance is not None and obj.expected_balance is not None:
            return obj.closing_balance - obj.expected_balance
        return None


class CashSessionSummarySerializer(serializers.ModelSerializer):
    opened_by_username = serializers.CharField(source='opened_by.username', read_only=True)
    gap                = serializers.SerializerMethodField()

    class Meta:
        model  = CashSession
        fields = [
            'id', 'status', 'start_time', 'end_time',
            'opening_balance', 'closing_balance', 'expected_balance',
            'opened_by_username', 'gap',
        ]

    def get_gap(self, obj):
        if obj.closing_balance is not None and obj.expected_balance is not None:
            return obj.closing_balance - obj.expected_balance
        return None