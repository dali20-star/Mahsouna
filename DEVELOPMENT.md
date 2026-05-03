# Project Architecture & Development Guide

## 🏗️ Architecture Overview

### Backend Architecture

```
Django REST API (Port 8000)
    │
    ├── Authentication Layer (JWT)
    │   └── apps/users/
    │
    ├── Content Management
    │   ├── apps/content/ (CRUD, Versioning)
    │   ├── apps/workflow/ (Approval System)
    │   └── apps/platforms/ (Account Management)
    │
    ├── Publishing System
    │   └── apps/scheduler/ (Queue & Scheduler)
    │
    ├── Analytics
    │   └── apps/dashboard/ (Statistics & Reports)
    │
    └── Database Layer (MySQL)
        └── All data persistence
```

### Frontend Architecture

```
React SPA (Port 3000)
    │
    ├── Authentication
    │   ├── pages/Login
    │   └── pages/Register
    │
    ├── Main Application
    │   ├── Dashboard (Statistics)
    │   ├── Content Management
    │   ├── Approval Workflow
    │   ├── Publishing Scheduler
    │   └── Platform Connections
    │
    ├── Components
    │   ├── Layout/Navigation
    │   ├── Modal/Form
    │   └── Card/Display
    │
    ├── API Client
    │   └── Axios + JWT Interceptors
    │
    └── State Management
        └── React Hooks + Context
```

### Data Flow

```
User Action (Frontend)
    ↓
React Component Updates State
    ↓
API Call (Axios)
    ↓
Backend Receives Request
    ↓
JWT Validation
    ↓
Business Logic Processing
    ↓
Database Operations
    ↓
JSON Response
    ↓
Frontend State Update
    ↓
UI Re-render
```

## 📦 Folder Structure Details

### Backend Apps Structure

Each Django app follows this pattern:

```
app_name/
├── __init__.py
├── models.py           # Database models
├── serializers.py      # DRF serializers
├── views.py           # API view logic
├── urls.py            # URL routing
├── apps.py            # App configuration
├── admin.py           # Django admin
├── tests.py           # Unit tests
└── migrations/        # Database migrations
```

### Frontend Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── styles/           # CSS files
├── App.js            # Main component
└── index.js          # Entry point
```

## 🔄 Common Workflows

### User Registration & Login Flow

1. User fills registration form
2. Frontend POSTs to `/api/users/register/`
3. Backend validates and creates user
4. User redirected to login
5. User enters credentials
6. Frontend POSTs to `/api/users/login/`
7. Backend returns JWT tokens
8. Frontend stores tokens in localStorage
9. Tokens included in all subsequent API calls

### Content Creation & Publishing Flow

```
Creator Creates Draft
    ↓
Saves to Database (Status: draft)
    ↓
Creator Submits for Approval
    ↓
Creates ApprovalWorkflow entry
    ↓
Status changes to 'submitted'
    ↓
Approver Reviews Content
    ↓
Approver Approves/Rejects
    ↓
Status changes to 'approved' / 'rejected'
    ↓
Creator Schedules Publication
    ↓
Creates PublishingSchedule entry
    ↓
Creates PublishingQueue entry
    ↓
At scheduled time, content is published
    ↓
Status changes to 'published'
```

## 🔐 Security Considerations

### Authentication & Authorization

- JWT tokens stored in localStorage (consider secure cookie for production)
- Token refresh mechanism for expired tokens
- Role-based access control (RBAC)
- Backend validates all requests

### Data Protection

- Passwords hashed using Django's default hasher
- Platform credentials should be encrypted (implement in production)
- CORS configured to allow only frontend domain
- HTTPS recommended for production

### Best Practices

- Never commit .env files with real credentials
- Use environment variables for all secrets
- Implement rate limiting (future enhancement)
- Add request logging and monitoring
- Regular security audits

## 🧪 Testing Strategy

### Backend Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.users

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test ComponentName
```

## 🚀 Performance Optimization

### Backend Optimization

- Database query optimization with select_related/prefetch_related
- Pagination for list endpoints
- Caching with Redis
- Celery for async tasks
- Database indexing on frequently queried fields

### Frontend Optimization

- React.memo for component memoization
- Lazy loading for routes
- Image optimization
- Code splitting
- CSS optimization

## 📝 Code Standards

### Backend Code Style

- PEP 8 compliant
- Django naming conventions
- Model method naming: `get_*`, `is_*`
- View class naming with suffix `ViewSet` or `APIView`

### Frontend Code Style

- React naming conventions
- Component names in PascalCase
- File names in camelCase or kebab-case
- Functional components (hooks)
- Props validation

## 🔌 API Development Guidelines

### Creating New Endpoints

1. Create model in models.py
2. Create serializer in serializers.py
3. Create viewset in views.py
4. Define permissions
5. Add routes in urls.py
6. Test with curl or Postman

### Response Format

All API responses follow this format:

```json
{
  "status": "success|error",
  "data": {...},
  "message": "Optional message",
  "errors": {...}
}
```

## 🐛 Debugging Tips

### Backend Debugging

```python
# Use Django Shell
python manage.py shell

# Add debug prints
print("Debug message", variable)

# Use pdb debugger
import pdb; pdb.set_trace()

# Check logs
tail -f logs/debug.log
```

### Frontend Debugging

```javascript
// Console logs
console.log("Debug:", data);

// React DevTools extension
// Network tab in browser DevTools

// useEffect dependency tracking
// Add ESLint rules for React
```

## 📦 Dependency Management

### Backend Dependencies

Organized in requirements.txt:
- Core: Django, REST Framework
- Auth: JWT authentication
- Database: MySQL connector
- Task Queue: Celery, Redis
- Utilities: date-fns, requests

### Frontend Dependencies

Organized in package.json:
- Core: React, React DOM, React Router
- API: Axios
- Icons: React Icons
- Styling: Tailwind CSS
- Dev: react-scripts

## 🔄 Version Control

### Branching Strategy

```
main (production)
├── develop (staging)
│   ├── feature/user-auth
│   ├── feature/content-crud
│   ├── feature/approval-workflow
│   ├── feature/scheduler
│   ├── bugfix/login-issue
│   └── ...
└── release/v0.2.0
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure allowed hosts
- [ ] Setup production database
- [ ] Configure Redis for caching
- [ ] Setup email backend
- [ ] Configure HTTPS/SSL
- [ ] Setup logging and monitoring
- [ ] Database backups configured
- [ ] Static files collected
- [ ] Media files storage configured
- [ ] API documentation updated
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Backup and recovery plan ready

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [DRF Documentation](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [REST API Best Practices](https://restfulapi.net/)

## 🆘 Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Check Stack Overflow
4. Review similar implementations
5. Open an issue with detailed information

---

**Last Updated**: April 2026
**Document Version**: 1.0
