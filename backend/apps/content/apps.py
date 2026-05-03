from django.apps import AppConfig

class ContentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.content'
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.content.signals  # noqa
