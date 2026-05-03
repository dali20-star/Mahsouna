from rest_framework import serializers
from apps.scheduler.models import PublishingSchedule, PublishingQueue
from apps.content.serializers import ContentListSerializer
from apps.platforms.serializers import PlatformAccountSerializer

class PublishingQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublishingQueue
        fields = ('id', 'status', 'attempts', 'max_attempts', 'created_at', 'updated_at')
        read_only_fields = ('id', 'attempts', 'created_at', 'updated_at')

class PublishingScheduleSerializer(serializers.ModelSerializer):
    content_detail = ContentListSerializer(source='content', read_only=True)
    platform_detail = PlatformAccountSerializer(source='platform_account', read_only=True)
    queue_entry = PublishingQueueSerializer(read_only=True)
    
    class Meta:
        model = PublishingSchedule
        fields = (
            'id', 'content', 'content_detail', 'platform_account', 'platform_detail',
            'scheduled_time', 'status', 'published_time', 'publication_url',
            'error_message', 'created_at', 'updated_at', 'queue_entry'
        )
        read_only_fields = ('id', 'published_time', 'publication_url', 'error_message', 'created_at', 'updated_at')

class PublishingScheduleListSerializer(serializers.ModelSerializer):
    content_detail = ContentListSerializer(source='content', read_only=True)
    platform_detail = PlatformAccountSerializer(source='platform_account', read_only=True)
    
    class Meta:
        model = PublishingSchedule
        fields = (
            'id', 'content', 'content_detail', 'platform_account', 'platform_detail',
            'scheduled_time', 'status', 'created_at'
        )
