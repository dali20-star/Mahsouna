from django.contrib import admin
from apps.content.models import Content, ContentVersion, BusinessInformation

@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'status', 'creator', 'created_at', 'published_at')
    list_filter = ('status', 'content_type', 'created_at')
    search_fields = ('title', 'body', 'tags')
    readonly_fields = ('created_at', 'updated_at', 'published_at')
    
    fieldsets = (
        ('Content Info', {
            'fields': ('title', 'content_type', 'body', 'description', 'tags', 'featured_image')
        }),
        ('Status', {
            'fields': ('status', 'creator')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'published_at')
        }),
    )

@admin.register(ContentVersion)
class ContentVersionAdmin(admin.ModelAdmin):
    list_display = ('content', 'version_number', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content__title', 'title')
    readonly_fields = ('created_at',)


@admin.register(BusinessInformation)
class BusinessInformationAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'industry', 'user', 'created_at', 'updated_at')
    list_filter = ('industry', 'created_at')
    search_fields = ('business_name', 'description', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'user')
    
    fieldsets = (
        ('Business Info', {
            'fields': ('business_name', 'industry', 'description')
        }),
        ('Targeting', {
            'fields': ('target_audience', 'goals')
        }),
        ('User', {
            'fields': ('user',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return self.readonly_fields + ['user']
        return self.readonly_fields
