from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.content.views import (
    ContentViewSet, BusinessInformationViewSet, 
    SocialMediaPlanViewSet, SocialMediaPostViewSet
)

content_router = DefaultRouter()
content_router.register(r'content', ContentViewSet, basename='content')

business_router = DefaultRouter()
business_router.register(r'', BusinessInformationViewSet, basename='business-info')

social_media_plan_router = DefaultRouter()
social_media_plan_router.register(r'', SocialMediaPlanViewSet, basename='social-media-plan')

social_media_post_router = DefaultRouter()
social_media_post_router.register(r'', SocialMediaPostViewSet, basename='social-media-post')

urlpatterns = [
    path('', include(content_router.urls)),
    path('business-info/', include(business_router.urls)),
    path('social-media-plans/', include(social_media_plan_router.urls)),
    path('social-media-posts/', include(social_media_post_router.urls)),
]
