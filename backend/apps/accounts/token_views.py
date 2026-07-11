from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        identifier = request.data.get('username', '') or request.data.get('email', '')

        # Vérifier suspension boutique avant même d'essayer l'auth
        if identifier:
            user = (
                User.objects.filter(email=identifier).select_related('boutique').first()
                or User.objects.filter(username=identifier).select_related('boutique').first()
            )
            if user and not user.is_superuser and user.boutique_id and not user.boutique.is_active:
                return Response(
                    {'detail': 'Cette boutique est suspendue. Veuillez contacter l\'administrateur.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200 and identifier:
            user = (
                User.objects.filter(email=identifier).first()
                or User.objects.filter(username=identifier).first()
            )
            if user:
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])

        return response
