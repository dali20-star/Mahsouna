import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', formData.username);
      const result = await login(formData.username, formData.password);
      console.log('✅ Login successful');
      setLoading(false);
      
      // Get user role from result
      const role = result?.role || localStorage.getItem('user_role');
      console.log('👤 User role:', role);
      
      // Determine redirect path based on role
      let redirectPath = '/';
      if (role === 'creator') {
        redirectPath = '/profile';
      } else if (role === 'admin') {
        redirectPath = '/users';
      } else if (role === 'manager') {
        redirectPath = '/approvals';
      }
      
      console.log('🔄 Redirecting to:', redirectPath);
      // No setTimeout - auth state is already updated in shared context
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = 
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] || 
        err.message || 
        'Login failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Content Hub</h1>
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
