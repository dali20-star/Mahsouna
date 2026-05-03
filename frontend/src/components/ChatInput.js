import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // Send on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
    // Or just Enter if no modifier
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="message-input"
          disabled={isLoading || disabled}
          maxLength={5000}
          rows={1}
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || disabled || !message.trim()}
          title="Send message (Ctrl+Enter)"
        >
          {isLoading ? (
            <>
              <span className="spinner-mini"></span>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span className="send-icon">📤</span>
              <span>Send</span>
            </>
          )}
        </button>
      </div>
      <div className="input-footer">
        <span className="char-count">{message.length} / 5000</span>
      </div>
    </form>
  );
};

export default ChatInput;
