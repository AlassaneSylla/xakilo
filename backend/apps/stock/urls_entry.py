from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_entries),
    path('<int:id>/', views.get_entry),
    path('add/', views.post_entry),
    path('<int:id>/update/', views.patch_entry),
    path('<int:id>/delete/', views.delete_entry),
    path('product/<int:product_id>/', views.get_entries_by_product),

    # path('', views.get_removals), 
    # path('<int:id>/', views.get_removal),
    # path('add/', views.post_removal),
    # path('<int:id>/update/', views.path_removal),
    # path("<int:id>/delete/", views.delete_removal),
]