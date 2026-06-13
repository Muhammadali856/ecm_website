from django.contrib import admin
from .models import Product, Feedback, Order, Voucher, UserProfile

# Register your models here so they show up in the admin panel
admin.site.register(Product)
admin.site.register(Feedback)
admin.site.register(Order)
admin.site.register(Voucher)
admin.site.register(UserProfile)