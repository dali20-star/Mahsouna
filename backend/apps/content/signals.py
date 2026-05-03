from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ContentDraft, SocialMediaPlan
from apps.workflow.models import ApprovalWorkflow
from apps.content.models import Content
from apps.users.models import CustomUser


@receiver(post_save, sender=ContentDraft)
def handle_content_publication(sender, instance, created, **kwargs):
    """
    Signal handler for when content status changes.
    When status is "published", print a message (mock publishing).
    """
    if instance.status == 'published':
        print(f"Publishing: {instance.title}")


@receiver(post_save, sender=SocialMediaPlan)
def auto_create_approval_workflow(sender, instance, created, **kwargs):
    """
    When a social media plan is created or updated, automatically create 
    an ApprovalWorkflow so managers can review it immediately.
    """
    try:
        # Get the creator (user who owns the business)
        creator = instance.business_info.user
        
        # Check if approval already exists for this plan
        try:
            approval = ApprovalWorkflow.objects.get(content__title=f"Social Media Plan: {instance.title}")
            return  # Already has workflow
        except ApprovalWorkflow.DoesNotExist:
            pass
        
        # Create a Content record to link with ApprovalWorkflow
        content, _ = Content.objects.get_or_create(
            title=f"Social Media Plan: {instance.title}",
            defaults={
                'creator': creator,
                'content_type': 'social_media',
                'body': f"Week {instance.week_number}: {instance.description}",
                'description': instance.description,
                'status': 'submitted'
            }
        )
        
        # Get a manager to assign this approval to
        manager = CustomUser.objects.filter(role='manager').first()
        
        # Create ApprovalWorkflow record
        ApprovalWorkflow.objects.get_or_create(
            content=content,
            defaults={
                'submitted_by': creator,
                'assigned_to': manager,
                'status': 'pending'
            }
        )
    except Exception as e:
        print(f"Error creating approval workflow for plan {instance.title}: {e}")
