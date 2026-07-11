from rest_framework import serializers
from .models import User, Boutique


class BoutiqueSerializer(serializers.ModelSerializer):
    user_count  = serializers.SerializerMethodField()
    owner_id    = serializers.SerializerMethodField()
    owner_name  = serializers.SerializerMethodField()
    owner_phone = serializers.SerializerMethodField()
    owner_email = serializers.SerializerMethodField()

    class Meta:
        model  = Boutique
        fields = [
            'id', 'name', 'phone', 'address', 'email', 'logo',
            'created_at', 'is_active',
            'user_count', 'owner_id', 'owner_name', 'owner_phone', 'owner_email',
        ]
        read_only_fields = ('created_at', 'owner_id', 'owner_name', 'owner_phone', 'owner_email', 'user_count')

    def _get_owner(self, obj):
        if hasattr(obj, '_owners'):
            return obj._owners[0] if obj._owners else None
        return obj.users.filter(role='OWNER').first()

    def get_user_count(self, obj):
        if hasattr(obj, '_user_count'):
            return obj._user_count
        return obj.users.count()

    def get_owner_id(self, obj):
        o = self._get_owner(obj)
        return o.id if o else None

    def get_owner_name(self, obj):
        o = self._get_owner(obj)
        if not o:
            return None
        full = f"{o.first_name} {o.last_name}".strip()
        return full or o.username

    def get_owner_phone(self, obj):
        o = self._get_owner(obj)
        return o.phone if o else None

    def get_owner_email(self, obj):
        o = self._get_owner(obj)
        return o.email if o else None


class UserSerializer(serializers.ModelSerializer):
    boutique_name    = serializers.CharField(source='boutique.name',    read_only=True)
    boutique_phone   = serializers.CharField(source='boutique.phone',   read_only=True)
    boutique_address = serializers.CharField(source='boutique.address', read_only=True)
    boutique_logo    = serializers.SerializerMethodField()
    email            = serializers.EmailField(required=True)

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'password', 'email',
            'first_name', 'last_name', 'phone', 'address',
            'role', 'boutique', 'boutique_name',
            'boutique_phone', 'boutique_address', 'boutique_logo',
            'is_active', 'last_login', 'date_joined',
            'is_staff', 'is_superuser',
        ]
        read_only_fields = (
            'last_login', 'date_joined',
            'boutique_name', 'boutique_phone', 'boutique_address', 'boutique_logo',
        )
        extra_kwargs = {'password': {'write_only': True}}

    def get_boutique_logo(self, obj):
        if not (obj.boutique and obj.boutique.logo):
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.boutique.logo.url)
        return obj.boutique.logo.url
