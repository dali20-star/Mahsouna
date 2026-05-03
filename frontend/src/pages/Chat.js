import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ChatWindow from '../components/ChatWindow';
import chatService from '../services/chatService';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.getAllSessions();
      setSessions(Array.isArray(data) ? data : []);
      
      // Select first session if available
      if (Array.isArray(data) && data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', {
        message: err.message,
        status: err.status,
        response: err.response?.data,
      });
      setError(`Failed to load chat sessions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      setError(null);
      const newSession = await chatService.createChatSession();
      
      // Validate response has required fields
      if (!newSession || !newSession.id) {
        console.error('Invalid session response:', newSession);
        setError('Server returned invalid session data. Please try again.');
        return;
      }
      
      setSessions([newSession, ...sessions]);
      setSelectedSessionId(newSession.id);
    } catch (err) {
      // Enhanced error logging
      console.error('Failed to create session:', {
        message: err.message,
        status: err.status,
        response: err.response?.data,
        url: '/api/chat/sessions/',
        method: 'POST'
      });
      
      // Show actionable error message
      if (err.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.status === 400) {
        const detail = err.response?.data?.detail || err.response?.data?.error || 'Invalid request';
        setError(`Invalid request: ${detail}`);
      } else if (err.status === 403) {
        setError('You do not have permission to create chats.');
      } else if (err.status === 500) {
        setError('Server error. Check browser console for details.');
      } else {
        setError(`Failed to create new chat: ${err.message}`);
      }
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      setError(null);
      await chatService.deleteChatSession(sessionId);
      
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      // If deleted session was selected, select another one
      if (selectedSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setSelectedSessionId(remainingSessions[0].id);
        } else {
          setSelectedSessionId(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete chat. Please try again.');
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h1>💬 Chat</h1>
        </div>

        <button
          className="new-chat-button"
          onClick={handleCreateNewSession}
          title="Create new chat"
        >
          <span className="button-icon">➕</span>
          <span className="button-text">New Chat</span>
        </button>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {error && (
          <div className="error-banner-compact">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="sessions-list">
          {isLoading && sessions.length === 0 ? (
            <div className="loading-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item"></div>
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${
                  selectedSessionId === session.id ? 'active' : ''
                }`}
                onClick={() => setSelectedSessionId(session.id)}
              >
                <div className="session-content">
                  <h3 className="session-title">{session.title}</h3>
                  <p className="session-meta">
                    {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                    {' • '}
                    {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete chat"
                  aria-label="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : searchTerm ? (
            <div className="empty-message">No chats match your search</div>
          ) : (
            <div className="empty-message">No chats yet. Create one to get started!</div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedSession ? (
          <ChatWindow
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
          />
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">💬</div>
            <h2>No Chat Selected</h2>
            <p>Create a new chat or select one from the list to get started</p>
            <button
              className="create-button-large"
              onClick={handleCreateNewSession}
            >
              Create New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
