import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content-wrapper">
        <div className="message-bubble">
          <p className="message-text">{message.content}</p>
          <span className="message-time">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
