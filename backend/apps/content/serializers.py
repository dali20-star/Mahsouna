from rest_framework import serializers
from apps.content.models import Content, ContentVersion, BusinessInformation, SocialMediaPlan, SocialMediaPost
from apps.users.serializers import CustomUserSerializer

class ContentVersionSerializer(serializers.ModelSerializer):
    created_by_detail = CustomUserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = ContentVersion
        fields = ('id', 'version_number', 'title', 'body', 'created_at', 'created_by', 'created_by_detail')
        read_only_fields = ('id', 'created_at', 'created_by')

class ContentSerializer(serializers.ModelSerializer):
    creator_detail = CustomUserSerializer(source='creator', read_only=True)
    versions = ContentVersionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Content
        fields = (
            'id', 'title', 'content_type', 'body', 'description', 'status',
            'featured_image', 'tags', 'creator', 'creator_detail', 'created_at',
            'updated_at', 'published_at', 'versions'
        )
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at', 'published_at')
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

class ContentListSerializer(serializers.ModelSerializer):
    creator_detail = CustomUserSerializer(source='creator', read_only=True)
    
    class Meta:
        model = Content
        fields = (
            'id', 'title', 'content_type', 'status', 'creator', 'creator_detail',
            'featured_image', 'created_at', 'updated_at', 'published_at'
        )


class BusinessInformationSerializer(serializers.ModelSerializer):
    user_detail = CustomUserSerializer(source='user', read_only=True)
    
    class Meta:
        model = BusinessInformation
        fields = (
            'id', 'business_name', 'industry', 'target_audience', 'goals',
            'description', 'plan_duration', 'platforms', 'user', 'user_detail', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class SocialMediaPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMediaPost
        fields = (
            'id', 'day', 'platform', 'caption', 'hashtags', 'time',
            'is_edited', 'plan', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class SocialMediaPlanSerializer(serializers.ModelSerializer):
    posts = SocialMediaPostSerializer(many=True, read_only=True)
    
    class Meta:
        model = SocialMediaPlan
        fields = (
            'id', 'title', 'description', 'week_number', 'business_info',
            'posts', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'business_info', 'status', 'created_at', 'updated_at')
