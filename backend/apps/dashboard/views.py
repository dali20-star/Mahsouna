from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.content.models import Content
from apps.workflow.models import ApprovalWorkflow
from apps.scheduler.models import PublishingSchedule
from apps.platforms.models import PlatformAccount

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = (IsAuthenticated,)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics"""
        user = request.user
        
        # Get user role and filter data accordingly
        if user.role == 'admin':
            # Admin sees all data
            total_content = Content.objects.count()
            draft_content = Content.objects.filter(status='draft').count()
            pending_approvals = ApprovalWorkflow.objects.filter(status='pending').count()
            published_content = Content.objects.filter(status='published').count()
            total_platform_accounts = PlatformAccount.objects.count()
            scheduled_publications = PublishingSchedule.objects.filter(status='scheduled').count()
            
            # Last 7 days stats
            seven_days_ago = timezone.now() - timedelta(days=7)
            recent_content = Content.objects.filter(created_at__gte=seven_days_ago).count()
            recent_publications = PublishingSchedule.objects.filter(published_time__gte=seven_days_ago).count()
            
            # Content by type
            content_by_type = Content.objects.values('content_type').annotate(count=Count('id'))
            
            # Approval stats
            approved_count = ApprovalWorkflow.objects.filter(status='approved').count()
            rejected_count = ApprovalWorkflow.objects.filter(status='rejected').count()
            
        elif user.role == 'manager':
            # Manager sees approval-related stats
            pending_approvals = ApprovalWorkflow.objects.filter(
                assigned_to=user, status='pending'
            ).count()
            approved_count = ApprovalWorkflow.objects.filter(
                assigned_to=user, status='approved'
            ).count()
            rejected_count = ApprovalWorkflow.objects.filter(
                assigned_to=user, status='rejected'
            ).count()
            total_content = None
            draft_content = None
            published_content = None
            total_platform_accounts = None
            scheduled_publications = None
            recent_content = None
            recent_publications = None
            content_by_type = None
            
        else:  # Creator
            # Creator sees their own stats
            total_content = Content.objects.filter(creator=user).count()
            draft_content = Content.objects.filter(creator=user, status='draft').count()
            pending_approvals = ApprovalWorkflow.objects.filter(submitted_by=user, status='pending').count()
            published_content = Content.objects.filter(creator=user, status='published').count()
            total_platform_accounts = PlatformAccount.objects.filter(user=user).count()
            scheduled_publications = PublishingSchedule.objects.filter(
                content__creator=user, status='scheduled'
            ).count()
            
            # Last 7 days stats
            seven_days_ago = timezone.now() - timedelta(days=7)
            recent_content = Content.objects.filter(
                creator=user, created_at__gte=seven_days_ago
            ).count()
            recent_publications = PublishingSchedule.objects.filter(
                content__creator=user, published_time__gte=seven_days_ago
            ).count()
            
            # Content by type
            content_by_type = Content.objects.filter(creator=user).values('content_type').annotate(count=Count('id'))
            
            # Approval stats
            approved_count = ApprovalWorkflow.objects.filter(submitted_by=user, status='approved').count()
            rejected_count = ApprovalWorkflow.objects.filter(submitted_by=user, status='rejected').count()
        
        return Response({
            'total_content': total_content,
            'draft_content': draft_content,
            'pending_approvals': pending_approvals,
            'published_content': published_content,
            'total_platform_accounts': total_platform_accounts,
            'scheduled_publications': scheduled_publications,
            'recent_content': recent_content,
            'recent_publications': recent_publications,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
            'content_by_type': list(content_by_type) if content_by_type else None,
        })
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Get recent activity"""
        user = request.user
        
        # Get recent content
        if user.role == 'admin':
            recent_content = Content.objects.all().order_by('-created_at')[:5]
            recent_publications = PublishingSchedule.objects.filter(
                status='published'
            ).order_by('-published_time')[:5]
        else:
            recent_content = Content.objects.filter(creator=user).order_by('-created_at')[:5]
            recent_publications = PublishingSchedule.objects.filter(
                content__creator=user, status='published'
            ).order_by('-published_time')[:5]
        
        from apps.content.serializers import ContentListSerializer
        from apps.scheduler.serializers import PublishingScheduleListSerializer
        
        return Response({
            'recent_content': ContentListSerializer(recent_content, many=True).data,
            'recent_publications': PublishingScheduleListSerializer(recent_publications, many=True).data,
        })
