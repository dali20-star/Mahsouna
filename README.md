<<<<<<< HEAD
# Mahsouna
pfe project 
=======
# SaaS Content Creation & Publication Platform

A comprehensive platform for automated content creation and publication workflow with multi-platform support.

## 🚀 Project Overview

This is a full-stack SaaS application that enables content creators to:
- ✅ Create and draft content in multiple formats
- ✅ Submit content for approval (role-based workflow)
- ✅ Schedule publications across multiple platforms
- ✅ Connect social media and publishing accounts
- ✅ Track content statistics and activity

**Phase 1 (MVP - Current)**: Core platform foundation without AI features
**Phase 2 (Future)**: AI copywriting, image/video generation, web crawler, SEO analysis

## 📋 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Django 4.2, Django REST Framework |
| **Frontend** | React 18, React Router 6 |
| **Authentication** | JWT (djangorestframework-simplejwt) |
| **Database** | MySQL |
| **Task Queue** | Celery + Redis |
| **API Documentation** | DRF browsable API |

## 📁 Project Structure

```
MahsounaDrira pfe/
├── backend/                    # Django Backend
│   ├── apps/
│   │   ├── users/             # User management & authentication
│   │   ├── content/           # Content CRUD & versioning
│   │   ├── workflow/          # Approval workflow system
│   │   ├── platforms/         # Multi-platform connections
│   │   ├── scheduler/         # Publishing queue & scheduler
│   │   └── dashboard/         # Analytics & statistics
│   ├── config/                # Django configuration
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
└── frontend/                   # React Frontend
    ├── src/
    │   ├── components/        # Reusable components
    │   ├── pages/            # Page components
    │   ├── hooks/            # Custom React hooks
    │   ├── utils/            # Utility functions
    │   ├── styles/           # CSS stylesheets
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── package.json
    ├── .env.example
    └── README.md
```

## 🔧 Features

### User Management & Authentication
- User registration (creator/approver roles)
- JWT-based authentication
- User profile management
- Role-based access control

### Content Management
- Create, edit, delete content drafts
- Support for multiple content types:
  - Articles
  - Blog Posts
  - Social Media Posts
  - Emails
  - Video Scripts
- Content versioning & history
- Tags and metadata

### Approval Workflow
- Role-based approvers
- Submit content for review
- Approve/Reject with comments
- Discussion threads
- Status tracking

### Publishing Scheduler
- Schedule content for future publication
- Support for multiple platforms:
  - WordPress
  - LinkedIn
  - Twitter/X
  - Email
- Publication history
- Failed publication retry logic
- Queue management

### Platform Connections
- Securely store platform credentials
- Connection verification
- Multiple accounts per platform
- Platform-specific configuration

### Dashboard & Analytics
- Real-time statistics:
  - Content counts by status
  - Pending approvals
  - Published count
  - Scheduled publications
- Recent activity feed
- Content performance metrics (phase 2)

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 5.7+
- Redis Server
- Git

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Setup database**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

**Backend runs on**: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
# Ensure REACT_APP_API_URL points to backend
```

4. **Start development server**
```bash
npm start
```

**Frontend runs on**: `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
```
POST   /api/users/register/          - Register new user
POST   /api/users/login/             - Login user
POST   /api/users/token/refresh/     - Refresh JWT token
GET    /api/users/profile/me/        - Get current user
PUT    /api/users/profile/           - Update profile
```

### Content Management
```
GET    /api/content/                 - List content
POST   /api/content/                 - Create content
GET    /api/content/{id}/            - Get content details
PUT    /api/content/{id}/            - Update content
DELETE /api/content/{id}/            - Delete content
POST   /api/content/{id}/submit_for_approval/   - Submit for approval
POST   /api/content/{id}/publish/    - Publish content
GET    /api/content/{id}/versions/   - Get version history
```

### Approval Workflow
```
GET    /api/workflow/                - List workflows
GET    /api/workflow/pending/        - Get pending approvals
GET    /api/workflow/{id}/           - Get workflow details
POST   /api/workflow/{id}/approve/   - Approve content
POST   /api/workflow/{id}/reject/    - Reject content
POST   /api/workflow/{id}/add_comment/ - Add comment
```

### Platform Integrations
```
GET    /api/platforms/accounts/      - List platform accounts
POST   /api/platforms/accounts/      - Add platform account
GET    /api/platforms/{id}/          - Get account details
PUT    /api/platforms/{id}/          - Update account
DELETE /api/platforms/{id}/          - Delete account
POST   /api/platforms/{id}/test_connection/ - Test connection
GET    /api/platforms/integrations/  - List available platforms
```

### Publishing Scheduler
```
GET    /api/scheduler/               - List schedules
POST   /api/scheduler/               - Create schedule
POST   /api/scheduler/schedule_content/ - Schedule publication
GET    /api/scheduler/pending_publications/  - Pending
GET    /api/scheduler/upcoming_publications/ - Upcoming
POST   /api/scheduler/{id}/cancel/   - Cancel schedule
```

### Dashboard
```
GET    /api/dashboard/stats/         - Get statistics
GET    /api/dashboard/recent_activity/ - Recent activity
```

## 👥 User Roles

### Creator
- Create and edit content drafts
- Submit content for approval
-  Schedule publications
- Connect platform accounts
- View own content statistics

### Approver
- Review submitted content
- Approve/reject with comments
- Add discussion comments
- View approval statistics

### Admin
- Full access to all features
- User management
- Platform configuration
- System-wide statistics

## 📋 Workflow

### Content Publishing Flow
1. **Creator** creates content draft
2. **Creator** submits for approval
3. **Approver** reviews and approves/rejects
4. **Creator** schedules approved content
5. **System** publishes on scheduled time
6. **Platform** automatically posts to connected accounts

## 🔐 Security Features

- JWT token-based authentication
- CORS configuration for frontend integration
- Database password encryption
- API platform credentials encryption (implement in production)
- Role-based access control
- HTTPS ready (production)

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📚 Database Models

### Users (CustomUser)
- username, email, password (encrypted)
- role (creator/approver/admin)
- profile_image, bio
- is_verified, is_active

### Content
- title, content_type, body
- creator (FK to CustomUser)
- status (draft/submitted/approved/rejected/published)
- featured_image, tags
- created_at, updated_at, published_at

### ContentVersion
- Tracks content changes
- version_number, changes history
- created_by (FK to CustomUser)

### ApprovalWorkflow
- content (FK to Content)
- submitted_by, assigned_to (FK to CustomUser)
- status (pending/approved/rejected)
- comment field
- submitted_at, reviewed_at

### ApprovalComment
- workflow (FK to ApprovalWorkflow)
- user (FK to CustomUser)
- comment text, created_at

### PlatformAccount
- user (FK to CustomUser)
- platform (wordpress/linkedin/twitter/email)
- account_name, credentials (JSON)
- is_active, is_verified

### PublishingSchedule
- content, platform_account (FKs)
- scheduled_time
- status (scheduled/published/failed/cancelled)
- publication_url, error_message

## 🚀 Deployment

### Backend Deployment (Production)
- Use gunicorn as WSGI server
- Configure MySQL production database
- Setup Redis for Celery
- Enable HTTPS
- Configure allowed hosts
- Set DEBUG=False
- Use environment variables for secrets

### Frontend Deployment (Production)
- Build: `npm run build`
- Deploy to CDN or static hosting
- Configure API URL to production backend
- Setup DNS/domain

## 📝 Future Enhancements (Phase 2)

- AI-powered content generation
- AI image/video generation
- Web crawler for content discovery
- SEO analysis and suggestions
- Advanced analytics dashboard
- Multiple user workspaces/teams
- Content calendar view
- Email notification system
- Batch operations
- Content templates
- Collaboration features
- Webhooks for platform events

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## ❓ Support

For issues or questions, please open an issue on the repository.

---

**Last Updated**: April 2026
**Version**: 0.1.0 (MVP)
>>>>>>> 06d6626 (Initial commit: Django + React SaaS platform with chatbot)
