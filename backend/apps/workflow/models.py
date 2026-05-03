from django.db import models
from apps.users.models import CustomUser
from apps.content.models import Content

class ApprovalWorkflow(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    id = models.AutoField(primary_key=True)
    content = models.OneToOneField(Content, on_delete=models.CASCADE, related_name='approval_workflow')
    submitted_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='submitted_approvals')
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_approvals', limit_choices_to={'role__in': ['manager', 'admin']})
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    comment = models.TextField(null=True, blank=True, help_text='Approver comments')
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'approval_workflows'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"Approval - {self.content.title} ({self.get_status_display()})"

class ApprovalComment(models.Model):
    """Comments in approval workflow"""
    id = models.AutoField(primary_key=True)
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'approval_comments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.workflow}"
