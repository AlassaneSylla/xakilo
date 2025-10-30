from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_removals), 
    path('<int:id>/', views.get_removal),
    path('add/', views.post_removal),
    path('<int:id>/update/', views.patch_removal),
    path("<int:id>/delete/", views.delete_removal),
]