from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # After successful auth, check boutique is_active
        if response.status_code == 200:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            identifier = request.data.get(self.get_serializer().username_field, '')
            try:
                user = User.objects.get(email=identifier)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(username=identifier)
                except User.DoesNotExist:
                    user = None

            if user:
                if not user.is_superuser and user.boutique_id and not user.boutique.is_active:
                    return Response(
                        {'detail': 'Ce compte est suspendu. Veuillez contacter l\'administrateur.'},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                from django.utils import timezone
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])

        return response
