from django.db import models
from apps.users.models import CustomUser


# Original Content model (for workflow app compatibility)
class Content(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted for Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('published', 'Published'),
    )
    
    CONTENT_TYPE_CHOICES = (
        ('article', 'Article'),
        ('blog_post', 'Blog Post'),
        ('social_media', 'Social Media Post'),
        ('email', 'Email'),
        ('video_script', 'Video Script'),
    )
    
    id = models.AutoField(primary_key=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_content')
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=50, choices=CONTENT_TYPE_CHOICES, default='article')
    body = models.TextField()
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    featured_image = models.ImageField(upload_to='content/', null=True, blank=True)
    tags = models.CharField(max_length=500, null=True, blank=True, help_text='Comma-separated tags')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'content'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class ContentVersion(models.Model):
    """Track version history of content"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'content_versions'
        unique_together = ('content', 'version_number')
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.content.title} - v{self.version_number}"


# New models as requested by user
class PlatformConnection(models.Model):
    """Store platform credentials for publishing"""
    PLATFORM_CHOICES = (
        ('wordpress', 'WordPress'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter'),
        ('email', 'Email'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='platform_connections')
    platform_name = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    api_key = models.CharField(max_length=500)  # In production, use encrypted field
    api_secret = models.CharField(max_length=500, null=True, blank=True)  # In production, use encrypted field
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'platform_connections'
        unique_together = ('user', 'platform_name')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_platform_name_display()}"


class ContentDraft(models.Model):
    """Content draft with approval workflow"""
    CONTENT_TYPE_CHOICES = (
        ('blog', 'Blog Post'),
        ('social', 'Social Media'),
        ('newsletter', 'Newsletter'),
    )
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('published', 'Published'),
    )
    
    title = models.CharField(max_length=255)
    body = models.TextField()
    content_type = models.CharField(max_length=50, choices=CONTENT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='content_drafts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    scheduled_publish_date = models.DateTimeField(null=True, blank=True)
    platform_to_publish = models.ForeignKey(PlatformConnection, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'content_drafts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class ApprovalWorkflow(models.Model):
    """Track content approval process"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    content = models.OneToOneField(ContentDraft, on_delete=models.CASCADE, related_name='approval_workflow')
    approver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='approvals_given')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    comments = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'content_approval_workflows'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Approval - {self.content.title} ({self.get_status_display()})"


class BusinessInformation(models.Model):
    """Store business/startup information for social media planning"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='business_info')
    business_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    target_audience = models.JSONField(default=list, help_text='List of target audience tags')
    goals = models.JSONField(default=list, help_text='List of business goals')
    description = models.TextField(help_text='Business description')
    plan_duration = models.CharField(max_length=10, default='7', help_text='Plan duration in days')
    platforms = models.JSONField(default=list, help_text='List of selected platforms')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'business_information'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.business_name} - {self.industry}"


class SocialMediaPlan(models.Model):
    """Store AI-generated social media plans"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted for Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('published', 'Published'),
    )
    
    business_info = models.ForeignKey(BusinessInformation, on_delete=models.CASCADE, related_name='plans')
    title = models.CharField(max_length=255)
    description = models.TextField()
    week_number = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'social_media_plans'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.business_info.business_name} - Week {self.week_number} ({self.get_status_display()})"


class SocialMediaPost(models.Model):
    """Store individual social media posts from AI plan"""
    PLATFORM_CHOICES = (
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
    )
    
    DAYS = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )
    
    plan = models.ForeignKey(SocialMediaPlan, on_delete=models.CASCADE, related_name='posts')
    day = models.CharField(max_length=20, choices=DAYS)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    caption = models.TextField()
    hashtags = models.JSONField(default=list, help_text='List of hashtags')
    time = models.TimeField(default='09:00')
    is_edited = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'social_media_posts'
        ordering = ['plan', 'day']
    
    def __str__(self):
        return f"{self.get_day_display()} - {self.get_platform_display()}"
