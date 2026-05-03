# SaaS Content Creation & Publication Platform - Frontend

A React-based frontend for managing content creation, approval workflows, and multi-platform publishing.

## Features

- **User Authentication**: Login/Register with JWT tokens
- **Content Management**: Create, edit, and delete content drafts
- **Approval Workflow**: Review and approve/reject submitted content
- **Publishing Scheduler**: Schedule content for future publication
- **Platform Connections**: Connect and manage social media accounts
- **Dashboard**: Real-time analytics and statistics

## Tech Stack

- React 18
- React Router 6
- Axios for API calls
- Tailwind CSS
- React Icons

## Installation

### Prerequisites
- Node.js 14+
- npm or yarn

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
Create `.env.local` file:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

3. **Start Development Server**
```babel
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Layout.js        # Main layout wrapper
│   │   ├── Navbar.js        # Top navigation
│   │   ├── Sidebar.js       # Side navigation
│   │   ├── Modal.js         # Modal component
│   │   └── Card.js          # Card component
│   ├── pages/               # Page components
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   ├── Dashboard.js     # Dashboard
│   │   ├── ContentManagement.js
│   │   ├── ApprovalWorkflow.js
│   │   ├── PublishingScheduler.js
│   │   └── PlatformConnections.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   └── useFetch.js      # Data fetching hook
│   ├── utils/               # Utility functions
│   │   └── api.js           # API client
│   ├── styles/              # CSS files
│   ├── App.js               # Main App component
│   └── index.js             # Entry point
├── package.json
└── .gitignore
```

## Available Pages

### Authenticated Routes
- `/` - Dashboard with statistics
- `/content` - Content management (creators)
- `/approvals` - Approval workflow (approvers)
- `/scheduler` - Publishing scheduler (creators)
- `/platforms` - Platform connections (creators)

### Public Routes
- `/login` - User login
- `/register` - User registration

## API Integration

The frontend communicates with the Django backend API at `/api/`:

### Authentication Endpoints
- `POST /users/register/` - Register new user
- `POST /users/login/` - Login user
- `POST /users/token/refresh/` - Refresh access token
- `GET /users/profile/me/` - Get current user

### Content Endpoints
- `GET /content/` - List content
- `POST /content/` - Create content
- `PUT /content/{id}/` - Update content
- `DELETE /content/{id}/` - Delete content
- `POST /content/{id}/submit_for_approval/` - Submit for approval

### Workflow Endpoints
- `GET /workflow/` - List approvals
- `POST /workflow/{id}/approve/` - Approve content
- `POST /workflow/{id}/reject/` - Reject content
- `POST /workflow/{id}/add_comment/` - Add comment

### Platform Endpoints
- `GET /platforms/accounts/` - List platform accounts
- `POST /platforms/accounts/` - Add platform account
- `POST /platforms/accounts/{id}/test_connection/` - Test connection

### Scheduler Endpoints
- `GET /scheduler/` - List schedules
- `POST /scheduler/schedule_content/` - Schedule publication
- `GET /scheduler/pending_publications/` - Get pending
- `POST /scheduler/{id}/cancel/` - Cancel schedule

### Dashboard Endpoints
- `GET /dashboard/stats/` - Get statistics
- `GET /dashboard/recent_activity/` - Get recent activity

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment

The frontend can be deployed to services like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## Development Tips

- Use the browser DevTools to inspect network requests
- Check localStorage for stored JWT tokens
- Use React DevTools extension for component inspection
- The API client automatically handles token refresh

## Contributing

Please follow the coding standards and component patterns established in the project.

## License

MIT License
