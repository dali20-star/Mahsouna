from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chat_session')

app_name = 'chat'

urlpatterns = [
    path('', include(router.urls)),
]
