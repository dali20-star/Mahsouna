import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import BusinessInformationPage from './pages/BusinessInformationPage';
import SocialMediaPlans from './pages/SocialMediaPlans';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import PublishingScheduler from './pages/PublishingScheduler';
import PlatformConnections from './pages/PlatformConnections';
import UserManagement from './pages/UserManagement';
import ContentWorkflow from './pages/ContentWorkflow';
import SocialMediaPlanAdmin from './pages/SocialMediaPlanAdmin';
import Chat from './pages/Chat';
import './App.css';

// Routes component that uses auth context
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route element={<Layout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content" element={<BusinessInformationPage />} />
          <Route path="/plans" element={<SocialMediaPlans />} />
          <Route path="/approvals" element={<ApprovalWorkflow />} />
          <Route path="/scheduler" element={<PublishingScheduler />} />
          <Route path="/platforms" element={<PlatformConnections />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/workflow" element={<ContentWorkflow />} />
          <Route path="/social-media-plans" element={<SocialMediaPlanAdmin />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
