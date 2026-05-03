from django.db import models
from apps.users.models import CustomUser

class PlatformAccount(models.Model):
    PLATFORM_CHOICES = (
        ('wordpress', 'WordPress'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter/X'),
        ('email', 'Email'),
    )
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='platform_accounts')
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    account_name = models.CharField(max_length=255, help_text='Display name for this connection')
    
    # Generic credentials storage (encrypted in production)
    credentials = models.JSONField(default=dict, help_text='Platform-specific credentials')
    
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'platform_accounts'
        unique_together = ('user', 'platform', 'account_name')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_platform_display()} - {self.account_name}"

class PlatformIntegration(models.Model):
    """Store and track platform integrations"""
    PLATFORM_CHOICES = (
        ('wordpress', 'WordPress'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter/X'),
        ('email', 'Email'),
    )
    
    id = models.AutoField(primary_key=True)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, unique=True)
    
    # Platform configuration
    api_endpoint = models.URLField()
    webhook_url = models.URLField(null=True, blank=True)
    requires_oauth = models.BooleanField(default=True)
    
    is_active = models.BooleanField(default=True)
    description = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'platform_integrations'
    
    def __str__(self):
        return self.get_platform_display()
