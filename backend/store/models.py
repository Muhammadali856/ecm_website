# store/models.py
from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Feedback(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.user.username} on {self.product.name}"

# NEW: User Profile to store the address
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

# NEW: Voucher system
class Voucher(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.IntegerField(default=10) # e.g., 10 for 10% off
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}%)"

# UPDATED: Now links directly to the User model instead of just an email string
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="Completed")

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"



