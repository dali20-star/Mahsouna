from rest_framework import serializers
from .models import ChatSession, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'user_id', 'title', 'created_at', 'updated_at', 'messages', 'message_count']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Validate title is not too long"""
        if len(value) > 255:
            raise serializers.ValidationError('Title cannot exceed 255 characters')
        return value

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chat sessions"""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'user_id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message']
        read_only_fields = fields

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        return ChatMessageSerializer(last_msg).data if last_msg else None
