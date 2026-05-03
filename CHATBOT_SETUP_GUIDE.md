# AI Chatbot Integration Guide

## Overview

This guide walks you through setting up the new AI chatbot feature in your Django + React platform. The chatbot uses OpenAI's GPT API to provide intelligent conversations with full conversation history support.

## Table of Contents

1. [Backend Setup](#backend-setup)
2. [Frontend Setup](#frontend-setup)
3. [Database Migration](#database-migration)
4. [Environment Configuration](#environment-configuration)
5. [Testing the Feature](#testing-the-feature)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Backend Setup

### 1. Install OpenAI Package

```bash
cd backend
venv\Scripts\pip install openai
```

The OpenAI Python client library will be used to communicate with GPT-3.5-turbo or GPT-4.

### 2. Verify Chat App Configuration

The chat app has already been:
- ✅ Added to `INSTALLED_APPS` in `config/settings.py`
- ✅ Registered in main URL routing (`config/urls.py`)
- ✅ Models and views created in `apps/chat/`

### 3. Run Database Migrations

```bash
cd backend
venv\Scripts\python manage.py makemigrations
venv\Scripts\python manage.py migrate
```

This creates two tables:
- `chat_chatsession` - Stores conversation sessions per user
- `chat_chatmessage` - Stores individual messages (user and AI responses)

### 4. Create Django Admin User (Optional)

To manage chats via Django admin:

```bash
venv\Scripts\python manage.py createsuperuser
```

Then visit `http://localhost:8000/admin/` to access the chat interface.

---

## Frontend Setup

### 1. Verify React Components

All components are pre-created in `frontend/src/`:

```
src/
├── components/
│   ├── ChatMessage.js       ✅ Individual message display
│   ├── ChatMessage.css
│   ├── ChatInput.js         ✅ Message input with send button
│   ├── ChatInput.css
│   ├── ChatWindow.js        ✅ Main chat interface
│   └── ChatWindow.css
├── pages/
│   ├── Chat.js              ✅ Chat sessions list and manager
│   └── Chat.css
├── services/
│   └── chatService.js       ✅ API communication layer
└── hooks/
    └── useAuth.js           (already exists)
```

### 2. Verify App Routes

The chat route has been added to `App.js`:
```javascript
<Route path="/chat" element={<Chat />} />
```

### 3. Verify Sidebar Navigation

The "Chat" link has been added to the sidebar for all user roles (creator, manager, admin) in `Sidebar.js`.

---

## Environment Configuration

### Set OpenAI API Key

**Option 1: Using `.env` file**

If you have a `.env` file in the backend folder:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
DEBUG=True
SECRET_KEY=your-secret-key
```

**Option 2: System Environment Variables (Windows)**

```powershell
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"
```

**Option 3: Permanently set (Windows)**

```powershell
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-actual-api-key-here", "User")
```

### Get Your OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (you can only see it once)
4. Add it to your environment as shown above

**⚠️ Important:**
- Never commit API keys to git
- Add `.env` to your `.gitignore`
- Keep your API key secret - it's linked to billing

---

## Database Migration

### First Time Setup

```bash
cd backend
venv\Scripts\python manage.py migrate
```

### If Database Already Exists

```bash
# Create migration files for the new chat app
venv\Scripts\python manage.py makemigrations

# Apply migrations
venv\Scripts\python manage.py migrate
```

### Check Migration Status

```bash
venv\Scripts\python manage.py showmigrations
```

---

## Testing the Feature

### 1. Start the Backend Server

```bash
cd backend
venv\Scripts\python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### 2. Start the Frontend Server

In a new terminal:

```bash
cd frontend
npm start
```

React should open at `http://localhost:3005`

### 3. Test the Chat Feature

1. **Login** with your account
2. **Navigate** to the Chat page from the sidebar menu
3. **Create** a new chat by clicking "New Chat"
4. **Send** a test message like "Hello, how can you help me?"
5. **Observe** the AI response

### Expected Behavior

- ✅ Messages appear instantly in the chat window
- ✅ User messages appear on the right (purple)
- ✅ AI responses appear on the left (gray)
- ✅ Conversation history is preserved
- ✅ Multiple chat sessions can be created
- ✅ Sessions appear in the left sidebar

---

## API Reference

### Endpoints

All endpoints require JWT authentication (Bearer token in Authorization header).

#### List Chat Sessions
```
GET /api/chat/sessions/
```
Returns paginated list of user's chat sessions.

**Response:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "How to optimize content...",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z",
      "message_count": 12,
      "last_message": {
        "id": 50,
        "role": "assistant",
        "content": "Great question! Here are some tips...",
        "created_at": "2024-01-15T11:00:00Z"
      }
    }
  ]
}
```

#### Get Specific Session
```
GET /api/chat/sessions/{id}/
```
Returns full session with all messages.

**Response:**
```json
{
  "id": 1,
  "title": "Content Strategy Discussion",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "message_count": 12,
  "messages": [
    {
      "id": 40,
      "role": "user",
      "content": "What content strategy do you recommend?",
      "created_at": "2024-01-15T10:31:00Z"
    },
    {
      "id": 41,
      "role": "assistant",
      "content": "Here are my recommendations...",
      "created_at": "2024-01-15T10:32:00Z"
    }
  ]
}
```

#### Create New Session
```
POST /api/chat/sessions/
```
Create a new empty chat session.

**Optional Request Body:**
```json
{
  "title": "My Chat Title"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "My Chat Title",
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "message_count": 0,
  "messages": []
}
```

#### Send Message
```
POST /api/chat/sessions/{id}/send_message/
```
Send a user message and receive AI response.

**Request Body:**
```json
{
  "message": "Your message here"
}
```

**Response:**
```json
{
  "user_message": {
    "id": 51,
    "role": "user",
    "content": "Your message here",
    "created_at": "2024-01-15T12:05:00Z"
  },
  "assistant_message": {
    "id": 52,
    "role": "assistant",
    "content": "AI response here...",
    "created_at": "2024-01-15T12:05:30Z"
  },
  "error": null
}
```

**Error Response (if OpenAI API fails):**
```json
{
  "user_message": {...},
  "assistant_message": null,
  "error": "Failed to get AI response. Please try again."
}
```

#### Delete Session
```
DELETE /api/chat/sessions/{id}/
```
Permanently delete a chat session and all its messages.

**Response:**
```
204 No Content
```

---

## Architecture Overview

### Data Flow

```
User Types Message
    ↓
React ChatInput Component
    ↓
chatService.sendMessage() API call
    ↓
Django POST /api/chat/sessions/{id}/send_message/
    ↓
Backend saves ChatMessage (role=user)
    ↓
Backend calls OpenAI API with conversation history
    ↓
Backend saves ChatMessage (role=assistant)
    ↓
Response with both messages sent to frontend
    ↓
React ChatWindow displays messages
    ↓
Auto-scroll to latest message
```

### Database Schema

**ChatSession Table:**
```
id (PK)
user_id (FK) → CustomUser
title (CharField)
created_at (DateTime)
updated_at (DateTime)
```

**ChatMessage Table:**
```
id (PK)
session_id (FK) → ChatSession
role (CharField: 'user' or 'assistant')
content (TextField)
created_at (DateTime)
```

### React Component Hierarchy

```
Chat Page
├── Sidebar (session list)
│   ├── New Chat Button
│   ├── Search Box
│   └── Session Items
└── Chat Main
    └── ChatWindow (if session selected)
        ├── Chat Header
        ├── Messages Container
        │   └── ChatMessage[] (for loop)
        ├── Loading Indicator
        └── ChatInput
            ├── Textarea
            └── Send Button
```

---

## Customization Options

### Change AI Model

In `backend/apps/chat/views.py`, change the `model` parameter:

```python
# Line ~150 in _get_ai_response method
response = client.chat.completions.create(
    model='gpt-4',  # Change from 'gpt-3.5-turbo' to 'gpt-4'
    messages=conversation_history,
    temperature=0.7,
    max_tokens=1000,
)
```

**Available Models:**
- `gpt-3.5-turbo` - Faster, cheaper (recommended)
- `gpt-4` - Smarter, slower, more expensive
- `gpt-4-turbo-preview` - Balance of speed and quality

### Adjust Temperature

Temperature controls response creativity (0-2):
- `0.0` - Deterministic, focused, factual
- `0.7` - Balanced (default)
- `1.5+` - Creative, varied responses

### Change Max Tokens

Limit response length:
- `500` - Short responses
- `1000` - Medium (default)
- `2000+` - Long responses

### Add System Prompt

Add a system message to guide the AI's behavior:

```python
conversation_history = [
    {
        'role': 'system',
        'content': 'You are a helpful marketing assistant for content creators.'
    }
]
for msg in previous_messages:
    conversation_history.append({...})
```

---

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution:**
1. Verify `OPENAI_API_KEY` is set in environment
2. Restart Django server after setting env var
3. Check Windows settings → Environment Variables

### Issue: "OpenAI SDK is not installed"

**Solution:**
```bash
cd backend
venv\Scripts\pip install openai --upgrade
```

### Issue: "Rate limit exceeded"

**Solution:**
- Wait a few seconds and try again
- Check OpenAI usage at https://platform.openai.com/account/billing/overview
- May need to add payment method or increase quota

### Issue: Messages not appearing

**Checklist:**
- [ ] Logged in with correct user
- [ ] Backend server running (`runserver`)
- [ ] Frontend server running (`npm start`)
- [ ] No CORS errors in browser console
- [ ] Check browser DevTools Network tab for API calls

### Issue: Database error "no such table"

**Solution:**
```bash
cd backend
venv\Scripts\python manage.py migrate
```

### Issue: Empty sidebar "No chats yet"

This is normal! You need to:
1. Click "New Chat" button
2. Start typing a message
3. Session will appear with auto-generated title

### Issue: Chat takes too long to respond

**Possible causes:**
- OpenAI API is slow (normal, can take 5-10 seconds)
- Network latency
- Model selected is slow (try gpt-3.5-turbo)

**Solution:** Wait or change model to faster option

### Issue: TypeError in console

If you see "Cannot read property 'results' of undefined":

**Solution:**
1. Check Django is returning correct format
2. Clear browser cache
3. Restart both servers

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `DEBUG = False` in settings
- [ ] Use environment variables for all secrets
- [ ] Set up proper database (PostgreSQL recommended)
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up SSL/HTTPS
- [ ] Review OpenAI rate limits and billing
- [ ] Test error handling thoroughly
- [ ] Set up logging for debugging
- [ ] Consider adding request rate limiting
- [ ] Monitor token usage and costs
- [ ] Set up monitoring/alerting
- [ ] Have backup API endpoint if OpenAI fails

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Django error logs: `backend/debug.log`
3. Check browser console (F12 → Console tab)
4. Check Network tab for API response details
5. Test API directly with curl or Postman

---

## Next Steps

### Enhance the Chatbot

- Add file upload support for documents
- Implement conversation sharing
- Add message editing/deletion
- Create chat templates/examples
- Add sentiment analysis
- Implement chat export (PDF/CSV)

### Integrate with Platform Features

- Link chat suggestions to content creation
- Use chat for customer feedback
- Auto-generate content from chat discussions
- Store chat insights in analytics

### Optimize Performance

- Implement chat pagination
- Add caching for popular responses
- Consider message compression
- Implement background task processing

---

## Files Modified/Created

### Backend
- ✅ `apps/chat/__init__.py` - New app
- ✅ `apps/chat/models.py` - ChatSession, ChatMessage
- ✅ `apps/chat/serializers.py` - API serializers
- ✅ `apps/chat/views.py` - Chat viewset with OpenAI integration
- ✅ `apps/chat/urls.py` - Chat API routes
- ✅ `apps/chat/admin.py` - Django admin integration
- ✅ `apps/chat/apps.py` - App configuration
- ✅ `config/settings.py` - Added 'apps.chat' to INSTALLED_APPS
- ✅ `config/urls.py` - Added chat URL routes

### Frontend
- ✅ `src/components/ChatMessage.js` - Message display component
- ✅ `src/components/ChatMessage.css` - Message styling
- ✅ `src/components/ChatInput.js` - Input and send button
- ✅ `src/components/ChatInput.css` - Input styling
- ✅ `src/components/ChatWindow.js` - Main chat interface
- ✅ `src/components/ChatWindow.css` - Chat styling
- ✅ `src/pages/Chat.js` - Chat page and session manager
- ✅ `src/pages/Chat.css` - Chat page styling
- ✅ `src/services/chatService.js` - API communication
- ✅ `src/App.js` - Added Chat import and route
- ✅ `src/components/Sidebar.js` - Added Chat navigation link

---

## Version History

- **v1.0** (2024-01-15)
  - Initial release
  - Basic chat functionality
  - OpenAI integration
  - Session management
  - Conversation history
  - Role-based access
