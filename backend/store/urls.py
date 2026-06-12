# store/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.get_products, name='get_products'),
    path('google-login/', views.google_login, name='google_login'),
    path('register/', views.register, name='register'),  
    path('standard-login/', views.standard_login, name='standard_login'), 
    path('checkout/', views.checkout, name='checkout'),
    path('validate-voucher/', views.validate_voucher, name='validate_voucher'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('my-orders/', views.get_user_orders, name='get_user_orders'),
    path('products/<int:pk>/', views.get_product_detail, name='product_detail'),
    path('products/<int:pk>/feedback/', views.submit_product_feedback, name='submit_product_feedback'),
    path('admin/add-product/', views.add_product, name='add_product'),
    path('admin/all-orders/', views.get_all_orders, name='get_all_orders'),
    path('admin/delete-product/<int:pk>/', views.delete_product, name='delete_product'),    
    path('admin/update-product/<int:pk>/', views.update_product, name='update_product'),
]