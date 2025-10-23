from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_users),
    path('add/', views.post_user),
    path('<int:id>/', views.get_user),
    path('<int:id>/update/', views.patch_user),
    path('<int:id>/delete/', views.delete_user)
]