from django.urls import path
from . import views

urlpatterns = [
    path('',               views.get_boutiques),
    path('add/',           views.post_boutique),
    path('<int:id>/',      views.get_boutique),
    path('<int:id>/update/', views.patch_boutique),
    path('<int:id>/delete/', views.delete_boutique),
]