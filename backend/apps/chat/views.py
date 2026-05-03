import os
import json
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.conf import settings
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatSessionListSerializer, ChatMessageSerializer

logger = logging.getLogger(__name__)

# Try to import OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI SDK not installed. Install with: pip install openai")


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat sessions and sending messages
    
    Endpoints:
    - GET /api/chat/sessions/ - List all user's chat sessions
    - POST /api/chat/sessions/ - Create new chat session
    - GET /api/chat/sessions/{id}/ - Get specific session with messages
    - POST /api/chat/sessions/{id}/send_message/ - Send message and get AI response
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users only see their own chat sessions"""
        if not self.request.user or not self.request.user.is_authenticated:
            return ChatSession.objects.none()
        return ChatSession.objects.filter(user=self.request.user).order_by('-updated_at')

    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return ChatSessionListSerializer
        return ChatSessionSerializer

    def create(self, request, *args, **kwargs):
        """Override create to handle errors gracefully"""
        logger.info(f'Creating chat session for user: {request.user} (authenticated: {request.user.is_authenticated})')
        logger.info(f'Request data: {request.data}')
        
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f'✓ Chat session created successfully for user {request.user.id}')
            return response
        except serializers.ValidationError as e:
            logger.error(f'❌ Validation error creating chat session: {str(e)}')
            return Response(
                {'error': f'Validation error: {str(e)}', 'type': 'validation'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f'❌ Unexpected error creating chat session for user {request.user.id}: {str(e)}', exc_info=True)
            return Response(
                {'error': f'Failed to create chat session: {str(e)}', 'type': 'server_error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """Automatically associate session with current user"""
        logger.info(f'perform_create called - User: {self.request.user}, Authenticated: {self.request.user.is_authenticated}')
        
        try:
            if not self.request.user or not self.request.user.is_authenticated:
                logger.warning('❌ Chat session creation attempted by unauthenticated user')
                raise serializers.ValidationError('User must be authenticated to create chat sessions')
            
            logger.info(f'Saving session with user={self.request.user.id}')
            serializer.save(user=self.request.user)
            logger.info(f'✓ Chat session saved successfully for user {self.request.user.id}')
        except Exception as e:
            logger.error(f'❌ Error in perform_create for user {self.request.user.id if self.request.user else "unknown"}: {str(e)}', exc_info=True)
            raise

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def send_message(self, request, pk=None):
        """
        Send a message and get AI response
        
        Request body:
        {
            "message": "Your message here"
        }
        
        Response:
        {
            "user_message": {...},
            "assistant_message": {...},
            "error": null
        }
        """
        session = self.get_object()
        message_text = request.data.get('message', '').strip()

        # Validate input
        if not message_text:
            return Response(
                {'error': 'Message cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(message_text) > 5000:
            return Response(
                {'error': 'Message is too long (max 5000 characters)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Save user message
            user_message = ChatMessage.objects.create(
                session=session,
                role='user',
                content=message_text
            )

            # Get previous messages for context (last 10 messages)
            previous_messages = ChatMessage.objects.filter(
                session=session
            ).exclude(id=user_message.id).order_by('created_at')[:10]

            # Build conversation history for API
            conversation_history = []
            for msg in previous_messages:
                conversation_history.append({
                    'role': msg.role,
                    'content': msg.content
                })
            
            # Add current user message
            conversation_history.append({
                'role': 'user',
                'content': message_text
            })

            # Get AI response
            assistant_response = self._get_ai_response(conversation_history, session)

            if assistant_response.get('error'):
                # If AI fails, still return user message but flag the error
                return Response({
                    'user_message': ChatMessageSerializer(user_message).data,
                    'assistant_message': None,
                    'error': assistant_response['error']
                }, status=status.HTTP_200_OK)

            # Save assistant message
            assistant_message = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=assistant_response['content']
            )

            # Update session title if this is first message
            if previous_messages.count() == 0:
                # Auto-generate title from first user message
                title = message_text[:50] + ('...' if len(message_text) > 50 else '')
                session.title = title
                session.save()

            return Response({
                'user_message': ChatMessageSerializer(user_message).data,
                'assistant_message': ChatMessageSerializer(assistant_message).data,
                'error': None
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Chat error for user {request.user.id}: {str(e)}")
            return Response(
                {'error': f'Failed to process message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_ai_response(self, conversation_history, session):
        """
        Call OpenAI API with conversation history
        
        Returns:
            {'content': 'response text', 'error': None} or
            {'content': None, 'error': 'error message'}
        """
        logger.info(f'_get_ai_response called for session {session.id}')
        
        if not OPENAI_AVAILABLE:
            logger.error('❌ OpenAI SDK is not installed')
            return {
                'content': None,
                'error': 'OpenAI SDK is not installed. Please install it with: pip install openai'
            }

        api_key = settings.OPENAI_API_KEY
        logger.info(f'OPENAI_API_KEY from settings: {"★" * 10 if api_key else "NOT SET"}')
        
        if not api_key:
            logger.error('❌ OpenAI API key not configured in settings')
            return {
                'content': None,
                'error': 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.'
            }

        try:
            client = OpenAI(api_key=api_key)
            
            response = client.chat.completions.create(
                model='gpt-3.5-turbo',  # or 'gpt-4' for better quality
                messages=conversation_history,
                temperature=0.7,
                max_tokens=1000,
                timeout=30
            )

            return {
                'content': response.choices[0].message.content,
                'error': None
            }

        except Exception as e:
            error_msg = str(e)
            logger.error(f"OpenAI API error: {error_msg}")
            
            # Provide user-friendly error messages
            if 'API key' in error_msg or 'auth' in error_msg.lower():
                return {
                    'content': None,
                    'error': 'Authentication error. Check OpenAI API key configuration.'
                }
            elif 'rate limit' in error_msg.lower():
                return {
                    'content': None,
                    'error': 'Rate limit exceeded. Please try again later.'
                }
            else:
                return {
                    'content': None,
                    'error': 'Failed to get AI response. Please try again.'
                }
