# AI Chatbot - Quick Start Guide

## ⚡ 30-Second Setup

### Step 1: Install OpenAI Package
```bash
cd backend
venv\Scripts\pip install openai
```

### Step 2: Set OpenAI API Key
Get your key from https://platform.openai.com/api-keys, then set it:

**Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY="sk-your-key-here"
```

**Or create `.env` in backend folder:**
```
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Run Migrations
```bash
venv\Scripts\python manage.py migrate
```

### Step 4: Start Servers
**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### Step 5: Access Chat
- Login to the platform
- Click "Chat" in the sidebar
- Click "New Chat"
- Start chatting! 🎉

---

## 📁 What Was Created

### Backend Files (`apps/chat/`)
```
models.py       → ChatSession, ChatMessage tables
serializers.py  → API data formatting
views.py        → OpenAI integration + endpoints
urls.py         → /api/chat/sessions/ routes
admin.py        → Django admin interface
apps.py         → App configuration
```

### Frontend Files
```
components/ChatMessage.js    → Message display (purple = user, gray = AI)
components/ChatInput.js      → Input box + send button
components/ChatWindow.js     → Main chat interface
pages/Chat.js                → Sessions list + page manager
services/chatService.js      → API communication
```

### Configuration Updates
```
config/settings.py    → Added 'apps.chat' to INSTALLED_APPS
config/urls.py        → Added /api/chat/ routes
App.js                → Added /chat route
Sidebar.js            → Added Chat menu item
requirements.txt      → Added openai==1.3.0
```

---

## 🎯 Key Features

✅ **Conversation History** - Messages saved per session  
✅ **Multiple Chats** - Create unlimited chat sessions  
✅ **Smart Responses** - Powered by OpenAI GPT-3.5-turbo  
✅ **Clean UI** - Matches your platform design  
✅ **Error Handling** - Graceful failure messages  
✅ **Responsive** - Works on desktop, tablet, mobile  
✅ **Secure** - API key only in backend, never exposed  
✅ **Role-Based** - All users (creator, manager, admin) can access  

---

## 🎨 UI Components

### Chat Window Layout
```
┌─────────────────────────────────┐
│ 💬 Chat Title     [Close Button] │  Header
├─────────────────────────────────┤
│                                 │
│  👤 User: "Hello!"              │  Messages Area
│     [timestamp]                 │  Auto-scroll enabled
│                                 │
│  🤖 AI: "Hi there! How can..." │  Message bubbles
│     [timestamp]                 │
│                                 │
│  ⌨️  [Type message...]  [Send ►]│  Input Area
└─────────────────────────────────┘

Sidebar:
┌─────────────┐
│ 💬 Chat     │
├─────────────┤
│ ➕ New Chat │  Session list
├─────────────┤
│ 🔍 Search   │
├─────────────┤
│ > Title 1   │
│ > Title 2   │  Click to select
│ > Title 3   │
└─────────────┘
```

---

## 🔑 Environment Variables

Required:
```
OPENAI_API_KEY=sk-...    # Get from https://platform.openai.com/api-keys
```

Recommended for production:
```
DEBUG=False
SECRET_KEY=your-secret-key-here
```

---

## 🧪 Test It

### Send a Message
```
User: "What are some tips for creating engaging content?"

AI: "Here are some proven strategies for engaging content:
1. Know your audience...
2. Use storytelling...
3. Post consistently..."
```

### Create Multiple Chats
1. Click "New Chat"
2. Different conversations are independent
3. Each session is listed in sidebar
4. Click to switch between them

### Delete a Chat
- Hover over a session in sidebar
- Click trash icon 🗑️
- Confirm deletion

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "OpenAI API key not configured" | Set `OPENAI_API_KEY` environment variable and restart Django |
| Messages not appearing | Check browser console (F12), ensure servers running |
| Chatbot is slow | Normal (API takes 5-10s). Try gpt-3.5-turbo instead of gpt-4 |
| "Rate limit exceeded" | Wait 1 minute, check OpenAI quota at platform.openai.com |
| Database error | Run `python manage.py migrate` |
| Empty sidebar | Normal! Click "New Chat" to create first session |

---

## 💾 API Endpoints

Access at `http://localhost:8000/api/chat/`

```
POST   /chat/sessions/              → Create new chat
GET    /chat/sessions/              → List all chats
GET    /chat/sessions/{id}/         → Get specific chat
POST   /chat/sessions/{id}/send_message/  → Send message + get AI reply
DELETE /chat/sessions/{id}/         → Delete chat
PATCH  /chat/sessions/{id}/         → Update chat title
```

All require JWT authentication (set in Login).

---

## 🚀 Performance Tips

1. **Restart Django** after setting environment variables
2. **Use gpt-3.5-turbo** (faster/cheaper) by default
3. **Increase max_tokens** if responses are cut off
4. **Add system prompt** to guide AI behavior
5. **Monitor API usage** at https://platform.openai.com/account/billing

---

## 📚 Full Documentation

For detailed setup, API reference, troubleshooting, and customization options, see:
👉 **[CHATBOT_SETUP_GUIDE.md](./CHATBOT_SETUP_GUIDE.md)**

---

## 📁 File Structure

```
MahsounaDrira pfe/
├── backend/
│   ├── apps/
│   │   └── chat/              ← NEW APP
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       ├── admin.py
│   │       ├── apps.py
│   │       └── __init__.py
│   ├── config/
│   │   ├── settings.py        ← UPDATED
│   │   └── urls.py            ← UPDATED
│   └── requirements.txt        ← UPDATED
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.js      ← NEW
│   │   │   ├── ChatMessage.css
│   │   │   ├── ChatInput.js        ← NEW
│   │   │   ├── ChatInput.css
│   │   │   ├── ChatWindow.js       ← NEW
│   │   │   ├── ChatWindow.css
│   │   │   └── Sidebar.js          ← UPDATED
│   │   ├── pages/
│   │   │   ├── Chat.js             ← NEW
│   │   │   └── Chat.css
│   │   ├── services/
│   │   │   └── chatService.js      ← NEW
│   │   └── App.js                  ← UPDATED
│   └── package.json
│
└── CHATBOT_SETUP_GUIDE.md         ← NEW
```

---

## 🎓 How It Works (High Level)

1. User types message in React textarea
2. Click send or press Enter
3. Message sent to Django API endpoint
4. Django saves user message to database
5. Django calls OpenAI API with conversation history
6. OpenAI returns AI response
7. Django saves AI response to database
8. Response sent back to React
9. Both messages displayed in chat window
10. Auto-scroll to show latest messages
11. User can continue conversation

---

## ✨ Next Steps (Optional Enhancements)

- [ ] Add typing indicator ("AI is typing...")
- [ ] Implement message reactions (👍 👎 ❤️)
- [ ] Add message search across all chats
- [ ] Export chat as PDF
- [ ] Share chat link with team
- [ ] Add chat categories/tags
- [ ] Implement message editing
- [ ] Add code highlighting in responses
- [ ] Create chat templates (e.g., "Content Ideas", "Social Media Tips")
- [ ] Add dark mode support

---

## 💬 Need Help?

1. Check the [CHATBOT_SETUP_GUIDE.md](./CHATBOT_SETUP_GUIDE.md) for detailed docs
2. Review error messages in browser console (F12)
3. Check Django terminal for server errors
4. Verify OpenAI API key is set and valid
5. Test API directly with Postman/curl

---

**Enjoy your new AI chatbot!** 🤖✨
