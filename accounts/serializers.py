from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_role', 'is_active', 'last_login', 'date_joined'
        ]
        read_only_fields = ('last_login', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True} 
        }