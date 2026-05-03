from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.content.models import Content, ContentVersion, BusinessInformation, SocialMediaPlan, SocialMediaPost
from apps.content.serializers import (
    ContentSerializer, ContentListSerializer, ContentVersionSerializer,
    BusinessInformationSerializer, SocialMediaPlanSerializer, SocialMediaPostSerializer
)
from apps.content.ai_service import AIContentGenerator

class ContentViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ContentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'content_type', 'creator']
    search_fields = ['title', 'body', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Content.objects.all()
        else:
            return Content.objects.filter(creator=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContentListSerializer
        return ContentSerializer
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    def perform_update(self, serializer):
        # Create version before updating
        old_content = self.get_object()
        version_number = old_content.versions.count() + 1
        ContentVersion.objects.create(
            content=old_content,
            version_number=version_number,
            title=old_content.title,
            body=old_content.body,
            created_by=self.request.user
        )
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit content for approval"""
        from apps.workflow.models import ApprovalWorkflow
        from apps.users.models import CustomUser
        
        content = self.get_object()
        if content.creator != request.user:
            return Response(
                {'detail': 'You can only submit your own content.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if content.status != 'draft':
            return Response(
                {'detail': 'Only draft content can be submitted for approval.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Change content status to submitted
        content.status = 'submitted'
        content.save()
        
        # Get a manager to assign this approval to
        manager = CustomUser.objects.filter(role='manager').first()
        
        # Create approval workflow record
        approval, created = ApprovalWorkflow.objects.update_or_create(
            content=content,
            defaults={
                'submitted_by': request.user,
                'assigned_to': manager,
                'status': 'pending'
            }
        )
        
        return Response(
            {
                'detail': 'Content submitted for approval.',
                'content': ContentSerializer(content, context={'request': request}).data
            }
        )
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish approved content"""
        content = self.get_object()
        if content.status != 'approved':
            return Response(
                {'detail': 'Only approved content can be published.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        from django.utils import timezone
        content.status = 'published'
        content.published_at = timezone.now()
        content.save()
        return Response(
            {
                'detail': 'Content published successfully.',
                'content': ContentSerializer(content, context={'request': request}).data
            }
        )
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of content"""
        content = self.get_object()
        versions = content.versions.all()
        serializer = ContentVersionSerializer(versions, many=True)
        return Response(serializer.data)


class BusinessInformationViewSet(viewsets.ModelViewSet):
    """ViewSet for Business Information"""
    permission_classes = (IsAuthenticated,)
    serializer_class = BusinessInformationSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return BusinessInformation.objects.all()
        else:
            return BusinessInformation.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_business(self, request):
        """Get current user's business information"""
        try:
            business = BusinessInformation.objects.get(user=request.user)
            serializer = self.get_serializer(business)
            return Response(serializer.data)
        except BusinessInformation.DoesNotExist:
            return Response(
                {'detail': 'No business information found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def admin_content_workflow(self, request):
        """Admin endpoint to view all businesses and their content workflow status"""
        from apps.users.models import CustomUser
        
        # Check if user is admin
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can view content workflow.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all businesses with their plans and posts
        businesses = BusinessInformation.objects.all().prefetch_related(
            'plans__posts',
            'user'
        )
        
        workflow_data = []
        for business in businesses:
            # Get all plans for this business
            plans = business.plans.all()
            
            # Collect posts from all plans
            for plan in plans:
                posts = plan.posts.all()
                
                for post in posts:
                    workflow_data.append({
                        'id': post.id,
                        'title': post.caption[:50] if post.caption else 'Untitled Post',
                        'business_name': business.business_name,
                        'creator': business.user.username if business.user else 'Unknown',
                        'creator_id': business.user.id if business.user else None,
                        'platform': post.platform,
                        'status': plan.status,
                        'day': post.day,
                        'created_at': plan.created_at.isoformat() if plan.created_at else None,
                        'updated_at': plan.updated_at.isoformat() if plan.updated_at else None,
                        'plan_id': plan.id,
                        'post_id': post.id,
                        'post_caption': post.caption,
                        'post_hashtags': post.hashtags,
                        'post_time': str(post.time) if post.time else None,
                    })
        
        # Sort by most recent first
        workflow_data = sorted(workflow_data, key=lambda x: x['created_at'], reverse=True)
        
        return Response({
            'count': len(workflow_data),
            'results': workflow_data
        })
    
    @action(detail=False, methods=['post'])
    def generate_plan(self, request):
        """Generate AI-powered social media plan for current user"""
        try:
            business = BusinessInformation.objects.get(user=request.user)
            
            # Prepare business info for AI
            business_info = {
                'business_name': business.business_name,
                'industry': business.industry,
                'target_audience': business.target_audience,
                'goals': business.goals,
                'description': business.description,
            }
            
            # Generate plan using AI
            ai_generator = AIContentGenerator()
            plan_data = ai_generator.generate_social_media_plan(business_info)
            
            # Create SocialMediaPlan
            plan = SocialMediaPlan.objects.create(
                business_info=business,
                title=f"Weekly Plan - {business.business_name}",
                description=plan_data.get('description', 'AI generated plan'),
                week_number=1
            )
            
            # Create SocialMediaPosts for each day and platform
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            platforms = ['instagram', 'facebook', 'twitter']
            
            for day_idx, day in enumerate(days):
                day_data = plan_data.get(day, {})
                for platform in platforms:
                    platform_data = day_data.get(platform, {})
                    if platform_data:
                        SocialMediaPost.objects.create(
                            plan=plan,
                            day=day,
                            platform=platform.upper(),
                            caption=platform_data.get('caption', ''),
                            hashtags=platform_data.get('hashtags', []),
                            time='09:00:00'  # Default time
                        )
            
            # Serialize and return the plan
            serializer = SocialMediaPlanSerializer(plan)
            return Response(
                {
                    'success': True,
                    'message': 'Social media plan generated successfully',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
            
        except BusinessInformation.DoesNotExist:
            return Response(
                {'detail': 'No business information found. Please complete your business profile first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': f'Error generating plan: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SocialMediaPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for Social Media Plans"""
    permission_classes = (IsAuthenticated,)
    serializer_class = SocialMediaPlanSerializer
    queryset = SocialMediaPlan.objects.all()
    
    def get_queryset(self):
        """Get plans - admins/managers see all, creators see their own"""
        user = self.request.user
        if user.role in ['admin', 'manager']:
            # Admin and manager see all plans
            return SocialMediaPlan.objects.all().order_by('-created_at')
        else:
            # Creators only see their own plans
            return SocialMediaPlan.objects.filter(business_info__user=user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def save_plan(self, request, pk=None):
        """Save finalized social media plan"""
        plan = self.get_object()
        
        # Update posts if provided
        posts_data = request.data.get('posts', [])
        for post_data in posts_data:
            try:
                post = SocialMediaPost.objects.get(id=post_data.get('id'))
                if 'caption' in post_data:
                    post.caption = post_data['caption']
                    post.is_edited = True
                if 'hashtags' in post_data:
                    post.hashtags = post_data['hashtags']
                if 'time' in post_data:
                    post.time = post_data['time']
                post.save()
            except SocialMediaPost.DoesNotExist:
                continue
        
        serializer = self.get_serializer(plan)
        return Response(
            {
                'success': True,
                'message': 'Plan saved successfully',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit social media plan for manager approval"""
        from apps.workflow.models import ApprovalWorkflow
        from apps.users.models import CustomUser
        
        plan = self.get_object()
        
        # Check if user owns this plan
        if plan.business_info.user != request.user:
            return Response(
                {'detail': 'You can only submit your own plans.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if plan is in draft status
        if plan.status != 'draft':
            return Response(
                {'detail': 'Only draft plans can be submitted for approval.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update plan status
        plan.status = 'submitted'
        plan.save()
        
        # Get a manager to assign this approval to
        manager = CustomUser.objects.filter(role='manager').first()
        
        # Create or update ApprovalWorkflow record
        # We'll store the Plan info in the Content-related record or create a generic approval
        # For now, using the Content model as a wrapper
        content, created = Content.objects.get_or_create(
            title=f"Social Media Plan: {plan.title}",
            defaults={
                'creator': request.user,
                'content_type': 'social_media',
                'body': f"Week {plan.week_number}: {plan.description}",
                'description': plan.description,
                'status': 'submitted'
            }
        )
        
        # Create approval workflow
        approval, workflow_created = ApprovalWorkflow.objects.update_or_create(
            content=content,
            defaults={
                'submitted_by': request.user,
                'assigned_to': manager,
                'status': 'pending'
            }
        )
        
        serializer = self.get_serializer(plan)
        return Response(
            {
                'detail': 'Plan submitted for approval successfully.',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )


class SocialMediaPostViewSet(viewsets.ModelViewSet):
    """ViewSet for Social Media Posts"""
    permission_classes = (IsAuthenticated,)
    serializer_class = SocialMediaPostSerializer
    queryset = SocialMediaPost.objects.all()
    
    def get_queryset(self):
        """Get posts for current user's plans"""
        user = self.request.user
        return SocialMediaPost.objects.filter(plan__business_info__user=user)
    
    def perform_destroy(self, instance):
        """Mark post as deleted instead of hard delete"""
        instance.delete()
        return Response({'detail': 'Post deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
