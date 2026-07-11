from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied


class BoutiqueAwareJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if not user.is_superuser and user.boutique_id:
            if not user.boutique.is_active:
                raise PermissionDenied(
                    "Cette boutique est suspendue. Veuillez contacter l'administrateur."
                )
        return user