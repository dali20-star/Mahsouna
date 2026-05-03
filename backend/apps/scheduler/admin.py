from django.contrib import admin
from apps.scheduler.models import PublishingSchedule, PublishingQueue

@admin.register(PublishingSchedule)
class PublishingScheduleAdmin(admin.ModelAdmin):
    list_display = ('content', 'platform_account', 'scheduled_time', 'status', 'published_time')
    list_filter = ('status', 'scheduled_time', 'created_at')
    search_fields = ('content__title', 'platform_account__account_name')
    readonly_fields = ('published_time', 'created_at', 'updated_at')

@admin.register(PublishingQueue)
class PublishingQueueAdmin(admin.ModelAdmin):
    list_display = ('schedule', 'status', 'attempts', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('schedule__content__title',)
    readonly_fields = ('created_at', 'updated_at')
