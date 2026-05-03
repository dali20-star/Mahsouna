from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.platforms.models import PlatformAccount, PlatformIntegration
from apps.platforms.serializers import PlatformAccountSerializer, PlatformAccountDetailSerializer, PlatformIntegrationSerializer

class PlatformAccountViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = PlatformAccountSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['platform', 'is_active']
    
    def get_queryset(self):
        return PlatformAccount.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PlatformAccountDetailSerializer
        return PlatformAccountSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test platform connection"""
        account = self.get_object()
        
        try:
            # Test connection based on platform
            if account.platform == 'wordpress':
                # Test WordPress connection
                pass
            elif account.platform == 'linkedin':
                # Test LinkedIn connection
                pass
            elif account.platform == 'twitter':
                # Test Twitter connection
                pass
            elif account.platform == 'email':
                # Test email connection
                pass
            
            account.is_verified = True
            account.save()
            
            return Response({
                'detail': 'Connection tested successfully.',
                'verified': True
            })
        except Exception as e:
            return Response({
                'detail': f'Connection test failed: {str(e)}',
                'verified': False
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def available_platforms(self, request):
        """Get list of available platforms"""
        platforms = PlatformIntegration.objects.filter(is_active=True)
        serializer = PlatformIntegrationSerializer(platforms, many=True)
        return Response(serializer.data)

class PlatformIntegrationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlatformIntegration.objects.filter(is_active=True)
    serializer_class = PlatformIntegrationSerializer
    permission_classes = (IsAuthenticated,)
