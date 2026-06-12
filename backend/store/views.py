# store/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Order, Voucher, UserProfile, Feedback
from .serializers import ProductSerializer, FeedbackSerializer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password

@api_view(['GET'])
def get_products(request):
    products = Product.objects.filter(is_active=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def register(request):
    # New manual sign up logic!
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')

    if User.objects.filter(username=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Create the user with a securely hashed password
    user = User.objects.create_user(username=email, email=email, password=password, first_name=first_name)
    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Registration successful',
        'access': str(refresh.access_token),
        # ADD last_name HERE:
        'user': {
            'email': user.email, 
            'first_name': user.first_name, 
            'last_name': user.last_name, 
            'is_staff': user.is_staff
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def standard_login(request):
    # New standard email/password login logic!
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Authenticate checks if the password matches the hash in the database
    user = authenticate(username=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'user': {
                'email': user.email, 
                'first_name': user.first_name, 
                'last_name': user.last_name, 
                'is_staff': user.is_staff
            }
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def google_login(request):
    token = request.data.get('token')
    
    try:
        # BE SURE TO PUT YOUR REAL CLIENT ID HERE AGAIN
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), '906031648073-l5nsoumi9devha6r1uuqffv5oihnn05s.apps.googleusercontent.com'
        )

        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        # get_or_create checks if they exist
        user, created = User.objects.get_or_create(
            username=email, 
            defaults={'email': email, 'first_name': first_name, 'last_name': last_name}
        )
        
        # FIXED: If they are a brand new Google user, lock their password securely
        if created:
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            # ADD last_name HERE:
            'user': {
                'email': user.email, 
                'first_name': user.first_name, 
                'last_name': user.last_name, 
                'is_staff': user.is_staff
            }
        }, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def checkout(request):
    email = request.data.get('email')
    cart_items = request.data.get('cart')

    if not email or not cart_items:
        return Response({'error': 'Missing email or cart data'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # FIXED: Safely check for the address without crashing!
    has_address = False
    try:
        if user.profile and user.profile.address:
            has_address = True
    except Exception: # Catches the error if the profile doesn't exist yet
        has_address = False

    if not has_address:
        return Response({
            'error': 'ADDRESS_REQUIRED', 
            'message': 'Please add a delivery address to your profile before checking out.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        for item in cart_items:
            product = Product.objects.get(id=item['id'])
            Order.objects.create(user=user, product=product, total_amount=product.price, status="Completed")
        return Response({'message': 'Checkout successful'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("CRITICAL CHECKOUT ERROR:", str(e))
        return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def validate_voucher(request):
    code = request.data.get('code')
    
    try:
        # Check if the code exists and is active
        voucher = Voucher.objects.get(code=code, is_active=True)
        return Response({
            'message': 'Voucher applied successfully!',
            'discount_percentage': voucher.discount_percentage
        }, status=status.HTTP_200_OK)
        
    except Voucher.DoesNotExist:
        # If the code is wrong or inactive, return an error
        return Response({'error': 'Invalid or expired voucher code.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def update_profile(request):
    email = request.data.get('email')
    address = request.data.get('address')
    new_password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')

    try:
        user = User.objects.get(email=email)
        
        # Update User model data
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        
        if new_password:
            user.password = make_password(new_password)
            
        user.save()

        # Update Profile model data (Address)
        if address:
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.address = address
            profile.save()

        # Return the updated user info to React
        return Response({
            'message': 'Profile updated successfully!',
            'user': {'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'is_staff': user.is_staff}
        }, status=status.HTTP_200_OK)
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def get_user_orders(request):
    email = request.data.get('email')
    
    # FIXED: Use .filter().first() instead of .get() to prevent crashes!
    user = User.objects.filter(email=email).first()
    
    if not user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        orders = Order.objects.filter(user=user).order_by('-order_date')
        
        order_data = []
        for order in orders:
            order_data.append({
                'id': order.id,
                'product_name': order.product.name,
                'product_image': order.product.image_url,
                'total_amount': order.total_amount,
                'status': order.status,
                'date': order.order_date.strftime("%b %d, %Y") 
            })
            
        return Response(order_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("CRITICAL HISTORY ERROR:", str(e))
        return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        feedbacks = Feedback.objects.filter(product=product).order_by('-created_at')
        
        # Package the product and its reviews together
        feedback_data = [{'user': f.user.first_name or f.user.username, 'message': f.message, 'date': f.created_at.strftime("%b %d, %Y")} for f in feedbacks]
        
        product_data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'image_url': product.image_url,
            'feedbacks': feedback_data
        }
        return Response(product_data, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def submit_product_feedback(request, pk):
    email = request.data.get('email')
    message = request.data.get('message')

    try:
        user = User.objects.get(email=email)
        product = Product.objects.get(pk=pk)
        
        # Check if the user ACTUALLY bought THIS specific product
        has_purchased = Order.objects.filter(user=user, product=product, status="Completed").exists()
        
        if not has_purchased:
            return Response({'error': 'You must purchase this product before leaving a review.'}, status=status.HTTP_403_FORBIDDEN)
            
        Feedback.objects.create(product=product, user=user, message=message)
        return Response({'message': 'Feedback added successfully!'}, status=status.HTTP_201_CREATED)
        
    except (User.DoesNotExist, Product.DoesNotExist):
        return Response({'error': 'Invalid user or product'}, status=status.HTTP_400_BAD_REQUEST)

# Add to the very bottom of views.py
@api_view(['POST'])
def add_product(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    # SECURITY: Reject anyone who isn't staff!
    if not user or not user.is_staff:
        return Response({'error': 'Unauthorized. Owners only.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# backend/store/views.py (Replace your get_all_orders function)
@api_view(['POST'])
def get_all_orders(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    # SECURITY: Reject anyone who isn't staff!
    if not user or not user.is_staff:
        return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

    orders = Order.objects.all().order_by('-order_date')
    
    order_data = []
    for order in orders:
        # Check if the user has a profile and an address saved
        address = "No Address Provided"
        if hasattr(order.user, 'profile') and order.user.profile.address:
            address = order.user.profile.address

        order_data.append({
            'id': order.id,
            'customer': order.user.email,
            'address': address, # <--- NEW: Added the address here!
            'product': order.product.name,
            'amount': order.total_amount,
            'status': order.status,
            'date': order.order_date.strftime("%b %d, %Y")
        })
    
    return Response(order_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def delete_product(request, pk):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    # SECURITY: Reject anyone who isn't staff!
    if not user or not user.is_staff:
        return Response({'error': 'Unauthorized. Owners only.'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        product = Product.objects.get(pk=pk)
        product.is_active = False  # SOFT DELETE: Hides it from the store but keeps order history!
        product.save()
        return Response({'message': 'Product successfully removed from storefront!'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_product(request, pk):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    if not user or not user.is_staff:
        return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
