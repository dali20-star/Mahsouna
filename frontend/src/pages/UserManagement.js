import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/UserManagement.css';
import { FiTrash2, FiUser, FiUsers, FiKey, FiPlus } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [createManagerModal, setCreateManagerModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [managerForm, setManagerForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  });

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [allResponse, creatorsResponse, managersResponse] = await Promise.all([
        api.get('/users/manage/'),
        api.get('/users/manage/creators/'),
        api.get('/users/manage/managers/')
      ]);

      const allData = Array.isArray(allResponse.data) ? allResponse.data : (allResponse.data.results || []);
      const creatorsData = Array.isArray(creatorsResponse.data) ? creatorsResponse.data : (creatorsResponse.data.results || []);
      const managersData = Array.isArray(managersResponse.data) ? managersResponse.data : (managersResponse.data.results || []);

      setUsers(allData);
      setCreators(creatorsData);
      setManagers(managersData);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete ${username}? This action cannot be undone.`)) {
      try {
        await api.delete(`/users/manage/${userId}/`);
        setSuccess(`✅ User "${username}" deleted successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Error deleting user';
        setError('❌ ' + errorMsg);
        console.error(err);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('❌ Please enter a new password');
      return;
    }

    try {
      await api.patch(`/users/manage/${selectedUser.id}/`, {
        password: newPassword
      });
      setSuccess(`✅ Password reset for ${selectedUser.username} successfully! New password: ${newPassword}`);
      setResetPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error resetting password';
      setError('❌ ' + errorMsg);
      console.error(err);
    }
  };

  const handleCreateManager = async () => {
    if (!managerForm.username.trim()) {
      setError('❌ Please enter a username');
      return;
    }
    if (!managerForm.email.trim()) {
      setError('❌ Please enter an email');
      return;
    }
    if (!managerForm.password.trim()) {
      setError('❌ Please enter a password');
      return;
    }

    try {
      await api.post('/users/', {
        username: managerForm.username,
        email: managerForm.email,
        first_name: managerForm.first_name,
        last_name: managerForm.last_name,
        password: managerForm.password,
        role: 'manager'
      });
      setSuccess(`✅ Manager "${managerForm.username}" created successfully!`);
      setCreateManagerModal(false);
      setManagerForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
      });
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error creating manager';
      setError('❌ ' + errorMsg);
      console.error(err);
    }
  };

  const getDisplayUsers = () => {
    if (activeTab === 'creators') return creators;
    if (activeTab === 'managers') return managers;
    return users;
  };

  const displayUsers = getDisplayUsers();

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="management-header">
        <div>
          <h1>👥 User Management</h1>
          <p className="subtitle">Manage content creators and managers</p>
        </div>
        <button
          className="btn-create-manager"
          onClick={() => setCreateManagerModal(true)}
        >
          <FiPlus size={18} />
          Create New Manager
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <FiUsers size={18} />
            All Users ({users.length})
          </button>
          <button
            className={`tab ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            <FiUser size={18} />
            Content Creators ({creators.length})
          </button>
          <button
            className={`tab ${activeTab === 'managers' ? 'active' : ''}`}
            onClick={() => setActiveTab('managers')}
          >
            <FiUser size={18} />
            Managers ({managers.length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-container">
        {displayUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found in this category</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="col col-username">Username</div>
              <div className="col col-name">Full Name</div>
              <div className="col col-email">Email</div>
              <div className="col col-role">Role</div>
              <div className="col col-joined">Joined</div>
              <div className="col col-action">Actions</div>
            </div>

            <div className="table-body">
              {displayUsers.map((user) => (
                <div key={user.id} className="table-row">
                  <div className="col col-username">
                    <span className="username-badge">{user.username}</span>
                  </div>
                  <div className="col col-name">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.first_name || user.last_name || '-'}
                  </div>
                  <div className="col col-email">
                    <span className="email-text">{user.email}</span>
                  </div>
                  <div className="col col-role">
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'creator' && '👤 Creator'}
                      {user.role === 'manager' && '👨‍💼 Manager'}
                      {user.role === 'admin' && '🔐 Admin'}
                    </span>
                  </div>
                  <div className="col col-joined">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </div>
                  <div className="col col-action">
                    <button
                      className="btn-reset-password"
                      onClick={() => {
                        setSelectedUser(user);
                        setResetPasswordModal(true);
                      }}
                      title={`Reset password for ${user.username}`}
                    >
                      <FiKey size={16} />
                      Reset Password
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      title={`Delete ${user.username}`}
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setResetPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 Reset Password</h2>
              <button 
                className="modal-close"
                onClick={() => setResetPasswordModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="user-info">
                Resetting password for: <strong>{selectedUser.username}</strong>
              </p>
              
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="form-input"
                />
              </div>

              <p className="password-note">
                💡 Share this password with the user securely
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setResetPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleResetPassword}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Manager Modal */}
      {createManagerModal && (
        <div className="modal-overlay" onClick={() => setCreateManagerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Create New Manager</h2>
              <button 
                className="modal-close"
                onClick={() => setCreateManagerModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={managerForm.username}
                  onChange={(e) => setManagerForm({...managerForm, username: e.target.value})}
                  placeholder="Enter username"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({...managerForm, email: e.target.value})}
                  placeholder="Enter email"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={managerForm.first_name}
                    onChange={(e) => setManagerForm({...managerForm, first_name: e.target.value})}
                    placeholder="First name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={managerForm.last_name}
                    onChange={(e) => setManagerForm({...managerForm, last_name: e.target.value})}
                    placeholder="Last name"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="text"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({...managerForm, password: e.target.value})}
                  placeholder="Enter password"
                  className="form-input"
                />
              </div>

              <p className="password-note">
                💡 The manager will use this username and password to login
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setCreateManagerModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreateManager}
              >
                Create Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
