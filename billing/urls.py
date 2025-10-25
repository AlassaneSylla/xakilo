from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_invoices),
    path('<int:id>/', views.get_invoice),
    path('add/', views.post_invoice)
]