from rest_framework import serializers
from .models import Entry, Removal


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = '__all__'

class RemovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Removal
        fields = '__all__'