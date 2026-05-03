from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone
from apps.scheduler.models import PublishingSchedule, PublishingQueue
from apps.scheduler.serializers import PublishingScheduleSerializer, PublishingScheduleListSerializer
from apps.content.models import Content
from apps.platforms.models import PlatformAccount

class PublishingScheduleViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = PublishingScheduleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'platform_account']
    ordering_fields = ['scheduled_time', 'created_at']
    ordering = ['scheduled_time']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PublishingSchedule.objects.all()
        else:
            return PublishingSchedule.objects.filter(content__creator=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PublishingScheduleListSerializer
        return PublishingScheduleSerializer
    
    def perform_create(self, serializer):
        schedule = serializer.save()
        # Create queue entry
        PublishingQueue.objects.create(schedule=schedule)
    
    @action(detail=False, methods=['post'])
    def schedule_content(self, request):
        """Schedule content for publishing"""
        content_id = request.data.get('content_id')
        platform_account_id = request.data.get('platform_account_id')
        scheduled_time = request.data.get('scheduled_time')
        
        try:
            content = Content.objects.get(id=content_id, creator=request.user)
        except Content.DoesNotExist:
            return Response(
                {'detail': 'Content not found or you do not have access.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if content.status != 'approved':
            return Response(
                {'detail': 'Only approved content can be scheduled for publishing.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            platform_account = PlatformAccount.objects.get(id=platform_account_id, user=request.user)
        except PlatformAccount.DoesNotExist:
            return Response(
                {'detail': 'Platform account not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        schedule = PublishingSchedule.objects.create(
            content=content,
            platform_account=platform_account,
            scheduled_time=scheduled_time
        )
        
        # Create queue entry
        PublishingQueue.objects.create(schedule=schedule)
        
        serializer = PublishingScheduleSerializer(schedule, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel scheduled publication"""
        schedule = self.get_object()
        
        if schedule.status not in ['scheduled', 'pending']:
            return Response(
                {'detail': 'Only scheduled publications can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        schedule.status = 'cancelled'
        schedule.save()
        
        return Response({
            'detail': 'Publication cancelled.',
            'schedule': PublishingScheduleSerializer(schedule, context={'request': request}).data
        })
    
    @action(detail=False, methods=['get'])
    def pending_publications(self, request):
        """Get pending publications for current user"""
        user = request.user
        schedules = PublishingSchedule.objects.filter(
            content__creator=user,
            status='scheduled',
            scheduled_time__lte=timezone.now()
        ).order_by('scheduled_time')
        
        serializer = PublishingScheduleListSerializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming_publications(self, request):
        """Get upcoming scheduled publications for current user"""
        user = request.user
        schedules = PublishingSchedule.objects.filter(
            content__creator=user,
            status='scheduled',
            scheduled_time__gt=timezone.now()
        ).order_by('scheduled_time')
        
        serializer = PublishingScheduleListSerializer(schedules, many=True)
        return Response(serializer.data)
