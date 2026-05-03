from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.platforms.views import PlatformAccountViewSet, PlatformIntegrationViewSet

router = DefaultRouter()
router.register(r'accounts', PlatformAccountViewSet, basename='account')
router.register(r'integrations', PlatformIntegrationViewSet, basename='integration')

urlpatterns = [
    path('', include(router.urls)),
]
