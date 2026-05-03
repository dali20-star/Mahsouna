import api from '../utils/api';

/**
 * Chat Service - Handles all HTTP requests to the Django chat API
 * 
 * API Endpoints:
 * - GET    /api/chat/sessions/ - List all chat sessions
 * - POST   /api/chat/sessions/ - Create new chat session
 * - GET    /api/chat/sessions/{id}/ - Get specific session
 * - POST   /api/chat/sessions/{id}/send_message/ - Send message
 */

const chatService = {
  /**
   * Get all chat sessions for current user
   * @returns {Promise<Array>} List of chat sessions
   */
  async getAllSessions() {
    try {
      const response = await api.get('/chat/sessions/');
      const data = response.data.results || response.data;
      if (!Array.isArray(data)) {
        console.warn('Unexpected response format for sessions:', data);
        return [];
      }
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      console.error('Error fetching chat sessions:', {
        status: error.response?.status,
        message: errorMsg,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Get specific chat session with all messages
   * @param {number} sessionId - The chat session ID
   * @returns {Promise<Object>} Chat session with messages
   */
  async getChatSession(sessionId) {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chat session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new chat session
   * @param {string} title - Optional title for the session
   * @returns {Promise<Object>} Created chat session
   */
  async createChatSession(title = null) {
    try {
      const payload = {};
      if (title) {
        payload.title = title;
      }
      const response = await api.post('/chat/sessions/', payload);
      return response.data;
    } catch (error) {
      // Log detailed error information for debugging
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error || 
                       error.response?.data?.message ||
                       error.message;
      const errorData = error.response?.data;
      
      console.error('Error creating chat session:', {
        status: error.response?.status,
        message: errorMsg,
        data: errorData,
        fullError: error
      });
      
      // Re-throw with enhanced error info
      const enhancedError = new Error(errorMsg);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      throw enhancedError;
    }
  },

  /**
   * Send a message to the chat and get AI response
   * @param {number} sessionId - The chat session ID
   * @param {string} message - User message
   * @returns {Promise<Object>} Response containing user and assistant messages
   */
  async sendMessage(sessionId, message) {
    try {
      const response = await api.post(
        `/chat/sessions/${sessionId}/send_message/`,
        { message }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Delete a chat session
   * @param {number} sessionId - The chat session ID
   * @returns {Promise<void>}
   */
  async deleteChatSession(sessionId) {
    try {
      await api.delete(`/chat/sessions/${sessionId}/`);
    } catch (error) {
      console.error(`Error deleting chat session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Update chat session title
   * @param {number} sessionId - The chat session ID
   * @param {string} title - New title
   * @returns {Promise<Object>} Updated chat session
   */
  async updateSessionTitle(sessionId, title) {
    try {
      const response = await api.patch(
        `/chat/sessions/${sessionId}/`,
        { title }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  },
};

export default chatService;
