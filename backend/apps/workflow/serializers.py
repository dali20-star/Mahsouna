from rest_framework import serializers
from apps.workflow.models import ApprovalWorkflow, ApprovalComment
from apps.users.serializers import CustomUserSerializer
from apps.content.serializers import ContentListSerializer

class ApprovalCommentSerializer(serializers.ModelSerializer):
    user_detail = CustomUserSerializer(source='user', read_only=True)
    
    class Meta:
        model = ApprovalComment
        fields = ('id', 'user', 'user_detail', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    submitted_by_detail = CustomUserSerializer(source='submitted_by', read_only=True)
    assigned_to_detail = CustomUserSerializer(source='assigned_to', read_only=True)
    content_detail = ContentListSerializer(source='content', read_only=True)
    comments = ApprovalCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = ApprovalWorkflow
        fields = (
            'id', 'content', 'content_detail', 'submitted_by', 'submitted_by_detail',
            'assigned_to', 'assigned_to_detail', 'status', 'comment', 'submitted_at',
            'reviewed_at', 'comments'
        )
        read_only_fields = ('id', 'submitted_by', 'submitted_at', 'reviewed_at')

class ApprovalListSerializer(serializers.ModelSerializer):
    content_detail = ContentListSerializer(source='content', read_only=True)
    submitted_by_detail = CustomUserSerializer(source='submitted_by', read_only=True)
    
    class Meta:
        model = ApprovalWorkflow
        fields = (
            'id', 'content', 'content_detail', 'submitted_by', 'submitted_by_detail', 
            'status', 'submitted_at', 'reviewed_at'
        )
