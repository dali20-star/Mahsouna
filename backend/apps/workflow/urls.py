from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.workflow.views import ApprovalWorkflowViewSet

router = DefaultRouter()
router.register(r'', ApprovalWorkflowViewSet, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
]
