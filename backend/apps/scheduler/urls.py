from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.scheduler.views import PublishingScheduleViewSet

router = DefaultRouter()
router.register(r'', PublishingScheduleViewSet, basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
]
