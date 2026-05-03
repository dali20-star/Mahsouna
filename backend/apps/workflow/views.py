from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone
from apps.workflow.models import ApprovalWorkflow, ApprovalComment
from apps.content.models import Content
from apps.workflow.serializers import ApprovalWorkflowSerializer, ApprovalListSerializer, ApprovalCommentSerializer

class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ApprovalWorkflowSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['submitted_at', 'reviewed_at']
    ordering = ['-submitted_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ApprovalWorkflow.objects.all()
        elif user.role == 'manager':
            return ApprovalWorkflow.objects.filter(assigned_to=user)
        else:
            return ApprovalWorkflow.objects.filter(submitted_by=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ApprovalListSerializer
        return ApprovalWorkflowSerializer
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending approvals"""
        user = request.user
        if user.role == 'manager':
            workflows = ApprovalWorkflow.objects.filter(assigned_to=user, status='pending')
        elif user.role == 'admin':
            workflows = ApprovalWorkflow.objects.filter(status='pending')
        else:
            return Response(
                {'detail': 'Only managers can view pending approvals.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ApprovalListSerializer(workflows, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve content"""
        workflow = self.get_object()
        user = request.user
        
        if workflow.assigned_to != user and user.role != 'admin':
            return Response(
                {'detail': 'You are not assigned to this approval.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if workflow.status != 'pending':
            return Response(
                {'detail': 'Only pending approvals can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workflow.status = 'approved'
        workflow.reviewed_at = timezone.now()
        workflow.comment = request.data.get('comment', '')
        workflow.save()
        
        # Update content status
        content = workflow.content
        content.status = 'approved'
        content.save()
        
        return Response(
            {
                'detail': 'Content approved successfully.',
                'workflow': ApprovalWorkflowSerializer(workflow, context={'request': request}).data
            }
        )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject content"""
        workflow = self.get_object()
        user = request.user
        
        if workflow.assigned_to != user and user.role != 'admin':
            return Response(
                {'detail': 'You are not assigned to this approval.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if workflow.status != 'pending':
            return Response(
                {'detail': 'Only pending approvals can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = request.data.get('comment', '')
        if not comment:
            return Response(
                {'detail': 'Rejection comment is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workflow.status = 'rejected'
        workflow.reviewed_at = timezone.now()
        workflow.comment = comment
        workflow.save()
        
        # Update content status
        content = workflow.content
        content.status = 'rejected'
        content.save()
        
        return Response(
            {
                'detail': 'Content rejected.',
                'workflow': ApprovalWorkflowSerializer(workflow, context={'request': request}).data
            }
        )
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add comment to approval workflow"""
        workflow = self.get_object()
        comment_text = request.data.get('comment', '')
        
        if not comment_text:
            return Response(
                {'detail': 'Comment is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = ApprovalComment.objects.create(
            workflow=workflow,
            user=request.user,
            comment=comment_text
        )
        serializer = ApprovalCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
