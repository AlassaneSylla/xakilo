from django.urls import path
from . import views

urlpatterns = [
     # for invoice
    path('', views.get_invoices),
    path('<int:id>/', views.get_invoice),
    path('add/', views.post_invoice),
    path('<int:id>/cancel/', views.canceled_invoice),
    path('cancellations/', views.get_cancellations),

    #invoices items 
    path("", views.get_invoices_items),
    path("<int:id>/", views.get_invoice_item),
    path('add/', views.post_invoice_item),
    path('<int:id>/update/', views.patch_invoice_item),
    path("<int:id>/delete/", views.delete_invoice_item),
]