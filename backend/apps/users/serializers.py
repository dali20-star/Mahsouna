from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.users.models import CustomUser
from django.contrib.auth import authenticate

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'profile_image', 'bio', 'created_at', 'date_joined')
        read_only_fields = ('id', 'created_at', 'is_verified', 'date_joined')

class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for admin to manage users and reset passwords"""
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'is_verified', 'profile_image', 'bio', 'created_at', 'date_joined')
        read_only_fields = ('id', 'created_at', 'is_verified', 'date_joined', 'username')
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # If password provided, set it
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role', 'profile_image')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        if CustomUser.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        if CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        return token
    
    def validate(self, attrs):
        # Call parent validate to get tokens
        data = super().validate(attrs)
        
        # Add full user data to response (no second API call needed in frontend)
        user_data = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'profile_image': str(self.user.profile_image) if self.user.profile_image else None,
            'bio': self.user.bio,
            'is_verified': self.user.is_verified,
        }
        
        data['user'] = user_data
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_image', 'bio', 'is_verified')
    
    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.bio = validated_data.get('bio', instance.bio)
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data['profile_image']
        instance.save()
        return instance
