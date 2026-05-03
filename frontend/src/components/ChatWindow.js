import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import chatService from '../services/chatService';
import './ChatWindow.css';

const ChatWindow = ({ sessionId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('New Chat');
  const messagesEndRef = useRef(null);

  // Load chat session when component mounts or sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadChatSession();
    }
  }, [sessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await chatService.getChatSession(sessionId);
      setMessages(session.messages || []);
      setSessionTitle(session.title || 'Chat');
    } catch (err) {
      console.error('Failed to load chat session:', err);
      setError('Failed to load chat session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Declare userMessage outside try-catch so it's accessible in catch block
    let userMessage;

    try {
      setError(null);
      setIsLoading(true);

      // Optimistically add user message
      userMessage = {
        id: Date.now(),
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to API
      const response = await chatService.sendMessage(sessionId, messageText);

      // Remove optimistic message and add real one
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));

      // Add real user message
      if (response.user_message) {
        setMessages((prev) => [...prev, response.user_message]);
      }

      // Add assistant response if available
      if (response.assistant_message) {
        setMessages((prev) => [...prev, response.assistant_message]);
      }

      // Update session title if this was first message
      if (response.assistant_message && messages.length === 0) {
        setSessionTitle(messageText.substring(0, 50));
      }

      // Handle API errors
      if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Remove optimistic message on error
      if (userMessage) {
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      }
      
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to send message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2 className="chat-title">{sessionTitle}</h2>
        {onClose && (
          <button
            className="close-button"
            onClick={onClose}
            title="Close chat"
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      <div className="chat-messages-container">
        {messages.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <h3>Start Chatting!</h3>
            <p>Send a message to begin your conversation with the AI assistant.</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button
              className="error-dismiss"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className="messages-list">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="message-loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!sessionId}
      />
    </div>
  );
};

export default ChatWindow;
