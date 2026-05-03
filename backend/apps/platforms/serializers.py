from rest_framework import serializers
from apps.platforms.models import PlatformAccount, PlatformIntegration

class PlatformAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformAccount
        fields = (
            'id', 'platform', 'account_name', 'is_active', 'is_verified',
            'created_at', 'updated_at', 'last_used'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'last_used')
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)

class PlatformAccountDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformAccount
        fields = (
            'id', 'platform', 'account_name', 'credentials', 'is_active', 'is_verified',
            'created_at', 'updated_at', 'last_used'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'last_used', 'is_verified')
        extra_kwargs = {
            'credentials': {'write_only': False}
        }

class PlatformIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformIntegration
        fields = (
            'id', 'platform', 'api_endpoint', 'webhook_url', 'requires_oauth',
            'is_active', 'description', 'created_at'
        )
        read_only_fields = ('id', 'created_at')
