from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [ 'id', 'username', 'password', 'email', 'first_name', 'last_name', 'is_active', 'last_login', 'date_joined', 'is_staff', 'is_superuser' ]
        read_only_fields = ('last_login', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True} 
        }