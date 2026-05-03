from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """Custom user model with additional fields"""
    ROLE_CHOICES = (
        ('creator', 'Content Creator'),
        ('manager', 'Manager'),
        ('admin', 'Administrator'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='creator')
    is_verified = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
