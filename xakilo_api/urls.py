from django.contrib import admin
from django.urls import include, path

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
    path('api/products/', include('products.urls')),
    path('api/invoices/', include('billing.urls')),
    path('api/invoices-items/', include('billing.urls')),
    path('api/entries/', include('stock.urls')),
    path('api/removals/', include('stock.urls')),
    path('api/users/', include('accounts.urls')),
    # path('api/logs/', include('logs.urls')),

    #for requests documentation : http://127.0.0.1:8000/swagger/
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
]
