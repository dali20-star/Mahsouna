from django.contrib import admin
from apps.users.models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_verified', 'created_at')
    list_filter = ('role', 'is_verified', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Info', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'profile_image', 'bio')
        }),
        ('Permissions', {
            'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
    )
