from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from apps.accounts.token_views import CustomTokenObtainPairView

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(title="Xakilo API", default_version='v1'),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', include('apps.products.urls')),
    path('api/entries/',  include('apps.stock.urls_entry')),
    path('api/removals/', include('apps.stock.urls_removal')),
    path('api/sessions/', include('apps.stock.urls_session')),
    path('api/users/',      include('apps.accounts.urls')),
    path('api/boutiques/', include('apps.accounts.boutique_urls')),

    # JWT tokens
    path('api/token/',           CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/',   TokenRefreshView.as_view(),     name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(),   name='token_blacklist'),

    # Swagger UI : http://localhost:8000/swagger/
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)