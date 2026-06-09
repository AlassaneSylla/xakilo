from django.urls import path
from . import views
from .views.payment_views import add_payment, list_payments

urlpatterns = [
    path('',                                  views.get_removals),
    path('unpaid/',                           views.get_unpaid_invoices),
    path('losses/',                           views.get_losses),
    path('<int:id>/',                          views.get_removal),
    path('add/',                               views.post_removal),
    path('<int:id>/update/',                   views.patch_removal),
    path('product/<int:product_id>/',          views.get_removals_by_product),
    path('<int:removal_id>/payments/',         list_payments),
    path('<int:removal_id>/payments/add/',     add_payment),
]