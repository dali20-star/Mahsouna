from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import UserRegistrationView, CustomTokenObtainPairView, UserProfileView, UserManagementViewSet

# Create separate routers to avoid conflicts
user_router = DefaultRouter()
user_router.register(r'profile', UserProfileView, basename='profile')
user_router.register(r'manage', UserManagementViewSet, basename='user-management')

urlpatterns = [
    path('register/', UserRegistrationView.as_view({'post': 'create'}), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(user_router.urls)),
]
