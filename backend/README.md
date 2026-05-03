# SaaS Content Creation & Publication Platform - Backend

A Django REST Framework backend for automated content creation and publication workflow.

## Features

- **JWT Authentication**: Secure user registration and login
- **Content Management**: Create, edit, delete content drafts with versioning
- **Approval Workflow**: Role-based approval system (creator → approver)
- **Publishing Queue**: Schedule content for future publication
- **Multi-Platform Connections**: Store credentials for WordPress, LinkedIn, Twitter, Email
- **Dashboard**: Real-time statistics and analytics

## Tech Stack

- Django 4.2
- Django REST Framework 3.14
- MySQL Database
- JWT Authentication
- Celery (for background tasks)
- Redis (for caching and message broker)

## Installation

### Prerequisites
- Python 3.8+
- MySQL 5.7+
- Redis Server
- Virtual Environment

### Setup Steps

1. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. **Database Setup**
```bash
python manage.py migrate
```

5. **Create Superuser**
```bash
python manage.py createsuperuser
```

6. **Run Development Server**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/token/refresh/` - Refresh JWT token
- `GET /api/users/profile/me/` - Get current user profile
- `PUT /api/users/profile/update_profile/` - Update user profile

### Content Management
- `GET /api/content/` - List all content
- `POST /api/content/` - Create new content
- `GET /api/content/{id}/` - Get content details
- `PUT /api/content/{id}/` - Update content
- `DELETE /api/content/{id}/` - Delete content
- `POST /api/content/{id}/submit_for_approval/` - Submit for approval
- `POST /api/content/{id}/publish/` - Publish approved content

### Approval Workflow
- `GET /api/workflow/` - List approval workflows
- `GET /api/workflow/pending/` - Get pending approvals
- `POST /api/workflow/{id}/approve/` - Approve content
- `POST /api/workflow/{id}/reject/` - Reject content
- `POST /api/workflow/{id}/add_comment/` - Add approval comment

### Platform Connections
- `GET /api/platforms/accounts/` - List connected platforms
- `POST /api/platforms/accounts/` - Connect new platform
- `GET /api/platforms/accounts/available_platforms/` - Get available platforms
- `POST /api/platforms/accounts/{id}/test_connection/` - Test connection

### Publishing Scheduler
- `GET /api/scheduler/` - List publishing schedules
- `POST /api/scheduler/schedule_content/` - Schedule content for publishing
- `GET /api/scheduler/pending_publications/` - Get pending publications
- `GET /api/scheduler/upcoming_publications/` - Get upcoming publications
- `POST /api/scheduler/{id}/cancel/` - Cancel scheduled publishing

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/dashboard/recent_activity/` - Get recent activity

## User Roles

1. **Creator**: Can create content, submit for approval, view publications
2. **Approver**: Can review and approve/reject submitted content
3. **Admin**: Full access to all features and data

## Database Models

### Users
- Custom user model with roles (creator, approver, admin)
- Profile information and verification status

### Content
- Versioned content drafts
- Support for multiple content types
- Status tracking (draft, submitted, approved, rejected, published)

### Workflow
- Approval workflows with comments
- Track approval status and history

### Platforms
- Platform account connections
- API credentials storage
- Connection verification

### Scheduler
- Publishing queue and schedules
- Retry logic for failed publishes
- Publication history

## Project Structure

```
backend/
├── apps/
│   ├── users/          # User management and auth
│   ├── content/        # Content CRUD operations
│   ├── workflow/       # Approval workflow
│   ├── platforms/      # Platform connections
│   ├── scheduler/      # Publishing queue
│   └── dashboard/      # Stats and analytics
├── config/             # Django settings
├── manage.py           # Django management
├── requirements.txt    # Python dependencies
└── .env.example        # Environment variables template
```

## Running Tests

```bash
python manage.py test
```

## Deployment

See production deployment guide in docs.

## Contributing

Please follow the contribution guidelines in CONTRIBUTING.md

## License

MIT License
