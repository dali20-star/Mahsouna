from django.db import models
from apps.users.models import CustomUser
from apps.content.models import Content
from apps.platforms.models import PlatformAccount

class PublishingSchedule(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('published', 'Published'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.AutoField(primary_key=True)
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='publishing_schedules')
    platform_account = models.ForeignKey(PlatformAccount, on_delete=models.SET_NULL, null=True, related_name='publishing_schedules')
    
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Publishing info
    published_time = models.DateTimeField(null=True, blank=True)
    publication_url = models.URLField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'publishing_schedules'
        ordering = ['scheduled_time']
        indexes = [
            models.Index(fields=['status', 'scheduled_time']),
            models.Index(fields=['content']),
        ]
    
    def __str__(self):
        return f"{self.content.title} - {self.platform_account.platform} ({self.get_status_display()})"

class PublishingQueue(models.Model):
    """Queue for pending publications"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    id = models.AutoField(primary_key=True)
    schedule = models.OneToOneField(PublishingSchedule, on_delete=models.CASCADE, related_name='queue_entry')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=3)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'publishing_queue'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Queue - {self.schedule.content.title} ({self.get_status_display()})"
