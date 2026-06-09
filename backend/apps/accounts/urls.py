from django.urls import path
from . import views
from .reports_views import get_reports

urlpatterns = [
    path('me/',              views.get_me),
    path('',                 views.get_users),
    path('add/',             views.post_user),
    path('<int:id>/',        views.get_user),
    path('<int:id>/update/', views.patch_user),
    path('<int:id>/delete/', views.delete_user),
    path('reports/',         get_reports),   # ?period=day|month|year
]