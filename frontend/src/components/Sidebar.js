import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiHome, FiFileText, FiCheckCircle, FiClock, FiLink, FiSettings, FiGrid, FiUsers, FiUser, FiTrendingUp, FiBarChart2, FiMessageCircle } from 'react-icons/fi';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Separate menu items by role
  const creatorMenuItems = [
    { path: '/profile', label: '1. My Profile', icon: FiUser, roles: ['creator'] },
    { path: '/content', label: '2. My Business', icon: FiFileText, roles: ['creator'] },
    { path: '/', label: '3. Dashboard', icon: FiHome, roles: ['creator'] },
    { path: '/plans', label: '4. Plans', icon: FiGrid, roles: ['creator'] },
    { path: '/scheduler', label: '5. Scheduler', icon: FiClock, roles: ['creator'] },
    { path: '/platforms', label: 'Platforms', icon: FiLink, roles: ['creator'] },
    { path: '/chat', label: 'Chat', icon: FiMessageCircle, roles: ['creator'] },
  ];

  const managerMenuItems = [
    { path: '/', label: 'Dashboard', icon: FiHome, roles: ['manager', 'admin'] },
    { path: '/approvals', label: 'Approvals', icon: FiCheckCircle, roles: ['manager', 'admin'] },
    { path: '/social-media-plans', label: 'Social Media Plans', icon: FiBarChart2, roles: ['manager', 'admin'] },
    { path: '/chat', label: 'Chat', icon: FiMessageCircle, roles: ['manager', 'admin'] },
  ];

  const adminMenuItems = [
    { path: '/', label: 'Dashboard', icon: FiHome, roles: ['admin'] },
    { path: '/approvals', label: 'Approvals', icon: FiCheckCircle, roles: ['admin'] },
    { path: '/social-media-plans', label: 'Social Media Plans', icon: FiBarChart2, roles: ['admin'] },
    { path: '/workflow', label: 'Content Workflow', icon: FiTrendingUp, roles: ['admin'] },
    { path: '/users', label: 'Users', icon: FiUsers, roles: ['admin'] },
    { path: '/chat', label: 'Chat', icon: FiMessageCircle, roles: ['admin'] },
  ];

  let menuItems = [];
  if (user?.role === 'creator') {
    menuItems = creatorMenuItems;
  } else if (user?.role === 'manager') {
    menuItems = managerMenuItems;
  } else if (user?.role === 'admin') {
    menuItems = adminMenuItems;
  }

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
