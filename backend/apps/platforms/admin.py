from django.contrib import admin
from apps.platforms.models import PlatformAccount, PlatformIntegration

@admin.register(PlatformAccount)
class PlatformAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'platform', 'account_name', 'is_active', 'is_verified', 'created_at', 'last_used')
    list_filter = ('platform', 'is_active', 'is_verified', 'created_at')
    search_fields = ('user__username', 'account_name')
    readonly_fields = ('created_at', 'updated_at', 'last_used')

@admin.register(PlatformIntegration)
class PlatformIntegrationAdmin(admin.ModelAdmin):
    list_display = ('platform', 'is_active', 'requires_oauth', 'created_at')
    list_filter = ('is_active', 'requires_oauth', 'created_at')
    search_fields = ('platform', 'description')
