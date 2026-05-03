import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiMenu, FiChevronDown, FiLogOut } from 'react-icons/fi';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    logout();
    console.log('✅ Logout complete, redirecting immediately...');
    // No setTimeout - auth state is already cleared in shared context, App will redirect automatically
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Content Hub</h1>
      </div>
      
      <div className="navbar-right">
        <div className="user-dropdown">
          <button 
            className="user-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{user?.username}</span>
            <FiChevronDown />
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p>{user?.email}</p>
                <small>{user?.role}</small>
              </div>
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
