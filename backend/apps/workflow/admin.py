from django.contrib import admin
from apps.workflow.models import ApprovalWorkflow, ApprovalComment

@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ('content', 'status', 'submitted_by', 'assigned_to', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'submitted_at', 'reviewed_at')
    search_fields = ('content__title', 'submitted_by__username', 'assigned_to__username')
    readonly_fields = ('submitted_at', 'reviewed_at')

@admin.register(ApprovalComment)
class ApprovalCommentAdmin(admin.ModelAdmin):
    list_display = ('workflow', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('workflow__content__title', 'user__username')
    readonly_fields = ('created_at',)
