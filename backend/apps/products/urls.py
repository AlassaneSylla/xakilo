from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_products),
    path('<int:id>/', views.get_product),
    path('add/', views.post_product),
    path('<int:id>/update/', views.patch_product),
    path('<int:id>/delete/', views.delete_product),
    path('low-stock/', views.low_stock_product), #stock faible
]