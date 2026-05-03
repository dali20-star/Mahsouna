# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8+, Node.js 14+, MySQL 5.7+, Redis

### Backend Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create database
# First, ensure MySQL is running and create the database:
# mysql -u root -p
# CREATE DATABASE saas_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 5. Configure environment
cp .env.example .env
# Edit .env and set: DB_USER, DB_PASSWORD, SECRET_KEY, CORS_ALLOWED_ORIGINS

# 6. Run migrations
python manage.py migrate

# 7. Create superuser
python manage.py createsuperuser
# Username: admin
# Password: (enter a password)
# Email: admin@example.com

# 8. Start server
python manage.py runserver
```

**Backend ready at**: http://localhost:8000
**Admin panel**: http://localhost:8000/admin

### Frontend Quick Start

```bash
# 1. Navigate to frontend (in new terminal)
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
# Create .env.local
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env.local

# 4. Start development server
npm start
```

**Frontend ready at**: http://localhost:3000

## 🧪 Test the Platform

### 1. Register a New User
- Go to http://localhost:3000/register
- Fill in the form
- Select role: "Content Creator" or "Content Approver"
- Click "Register"

### 2. Login
- Go to http://localhost:3000/login
- Use credentials from registration
- Click "Login"

### 3. Create Content (Creator)
- Click "Content" in sidebar
- Click "New Content"
- Fill in title, type, and body
- Click "Create"

### 4. Submit for Approval (Creator)
- Click on the content you created
- Click "Submit for Approval" button

### 5. Approve Content (Approver)
- Login as an approver user
- Click "Approvals" in sidebar
- Click "View Details" on pending approval
- Review content and click "Approve" or "Reject"

### 6. Schedule Publication (Creator)
- Go to "Scheduler"
- Click "Schedule Publication"
- Select approved content
- Select platform connection
- Set date/time
- Click "Schedule"

### 7. Connect Platforms (Creator)
- Go to "Platforms"
- Click "Add Connection"
- Select platform (WordPress, LinkedIn, Twitter, Email)
- Enter credentials
- Click "Add Connection"
- Click "Test Connection" to verify

## 📊 Dashboard
- View all statistics
- See recent content and publications
- Monitor pending approvals

## 🔗 Important URLs

| URL | Purpose |
|-----|---------|
| http://localhost:8000 | Django Backend |
| http://localhost:8000/admin | Django Admin Panel |
| http://localhost:8000/api | API Root |
| http://localhost:3000 | React Frontend |
| http://localhost:3000/login | Login Page |
| http://localhost:3000 | Dashboard |

## 📚 API Examples

### Get Access Token
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

### Create Content
```bash
curl -X POST http://localhost:8000/api/content/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "content_type": "article",
    "body": "Content goes here...",
    "description": "Article description"
  }'
```

### Get All Content
```bash
curl http://localhost:8000/api/content/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check DB credentials in .env
- Run: `python manage.py migrate`

### Frontend Can't Connect to Backend
- Check CORS_ALLOWED_ORIGINS in backend settings
- Ensure backend is running
- Check REACT_APP_API_URL in frontend .env

### ModuleNotFoundError
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt`

### npm Dependencies Error
- Delete node_modules: `rm -rf node_modules`
- Clear npm cache: `npm cache clean --force`
- Reinstall: `npm install`

## 📖 Documentation

- [Backend README](./backend/README.md) - Detailed backend docs
- [Frontend README](./frontend/README.md) - Detailed frontend docs
- [Main README](./README.md) - Full project documentation

## ✨ Next Steps

1. Explore the admin panel at http://localhost:8000/admin
2. Create test users with different roles
3. Test the entire workflow
4. Customize the platform for your needs
5. Add your own platform integrations

## 🎯 Key Features to Try

- ✅ **User Management**: Create users with different roles
- ✅ **Content Creation**: Draft and create various content types
- ✅ **Approval Workflow**: Review and approve/reject content
- ✅ **Publishing**: Schedule content for future publication
- ✅ **Platforms**: Connect multiple social media accounts
- ✅ **Dashboard**: View statistics and activity

## 🚀 Common Development Tasks

### View Logs
```bash
# Backend logs appear in terminal running Django
# Frontend logs appear in terminal running npm start
```

### Reset Database
```bash
cd backend
rm db.sqlite3  # If using SQLite
python manage.py migrate  # If using MySQL, data persists
```

### Create Test Data
```bash
cd backend
python manage.py shell
# In shell:
from apps.users.models import CustomUser
from apps.content.models import Content
# Create test data
```

### Update Dependencies
```bash
# Backend
pip install -r requirements.txt --upgrade

# Frontend
npm update
```

---

**Need Help?** Check the detailed documentation in [README.md](./README.md)
