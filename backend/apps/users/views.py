from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.users.models import CustomUser
from apps.users.serializers import (
    CustomUserSerializer,
    UserManagementSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
)


class IsAdmin(BasePermission):
    """Permission class to check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class UserRegistrationView(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'user': CustomUserSerializer(user).data,
                    'message': 'User registered successfully'
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (AllowAny,)

class UserProfileView(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)
    
    def list(self, request):
        """Return current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Handle PUT and PATCH requests for profile update"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Handle PUT requests for profile update"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, pk=None):
        """Handle PATCH requests for profile update (even without pk)"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for admin to manage all users (creators, managers, admins)"""
    queryset = CustomUser.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = (IsAdmin,)
    
    def get_queryset(self):
        """Admin can see all users"""
        return CustomUser.objects.all().order_by('-date_joined')
    
    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'list' or self.action == 'retrieve':
            return CustomUserSerializer
        return UserManagementSerializer
    
    @action(detail=False, methods=['get'])
    def creators(self, request):
        """Get all content creators"""
        creators = CustomUser.objects.filter(role='creator')
        serializer = CustomUserSerializer(creators, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def managers(self, request):
        """Get all managers"""
        managers = CustomUser.objects.filter(role='manager')
        serializer = CustomUserSerializer(managers, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a user"""
        user = self.get_object()
        if user.role == 'admin' and CustomUser.objects.filter(role='admin').count() == 1:
            return Response(
                {'detail': 'Cannot delete the last admin user.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
