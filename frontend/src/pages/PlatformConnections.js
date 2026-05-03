import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import '../styles/PlatformConnections.css';

const PlatformConnections = () => {
  const [accounts, setAccounts] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    account_name: '',
    credentials: {},
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchAvailablePlatforms();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/platforms/accounts/');
      setAccounts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlatforms = async () => {
    try {
      const response = await api.get('/platforms/accounts/available_platforms/');
      setAvailablePlatforms(response.data);
    } catch (err) {
      console.error('Failed to fetch available platforms');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/platforms/accounts/', formData);
      setModalOpen(false);
      setFormData({ platform: '', account_name: '', credentials: {} });
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding account');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        await api.delete(`/platforms/accounts/${id}/`);
        fetchAccounts();
      } catch (err) {
        setError('Error deleting account');
      }
    }
  };

  const handleTestConnection = async (id) => {
    try {
      await api.post(`/platforms/accounts/${id}/test_connection/`);
      alert('Connection verified successfully!');
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection test failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('cred_')) {
      const credKey = name.replace('cred_', '');
      setFormData(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          [credKey]: value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) return <div className="loading">Loading platforms...</div>;

  return (
    <div className="platforms-container">
      <div className="platforms-header">
        <h1>Platform Connections</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Add Connection
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="platforms-list">
        {accounts.map(account => (
          <Card key={account.id} className="platform-card">
            <div className="platform-card-header">
              <h3>{account.account_name}</h3>
              <span className={`platform-badge ${account.platform}`}>
                {account.platform}
              </span>
            </div>
            
            <div className="platform-info">
              <p>
                Status: {account.is_active ? '✓ Active' : '✗ Inactive'}
              </p>
              <p>
                Verified: {account.is_verified ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            
            <div className="platform-actions">
              {!account.is_verified && (
                <button 
                  className="btn-secondary btn-small"
                  onClick={() => handleTestConnection(account.id)}
                >
                  <FiCheck /> Test Connection
                </button>
              )}
              <button 
                className="btn-danger btn-small"
                onClick={() => handleDelete(account.id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Platform Connection"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Platform</label>
            <select 
              name="platform" 
              value={formData.platform} 
              onChange={handleChange}
              required
            >
              <option value="">Select platform</option>
              <option value="wordpress">WordPress</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              required
              placeholder="e.g., My WordPress Blog"
            />
          </div>

          {formData.platform === 'wordpress' && (
            <>
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="password"
                  name="cred_api_key"
                  onChange={handleChange}
                  placeholder="WordPress API key"
                  required
                />
              </div>
              <div className="form-group">
                <label>Site URL</label>
                <input
                  type="url"
                  name="cred_site_url"
                  onChange={handleChange}
                  placeholder="https://example.com"
                  required
                />
              </div>
            </>
          )}

          {formData.platform === 'linkedin' && (
            <>
              <div className="form-group">
                <label>Access Token</label>
                <input
                  type="password"
                  name="cred_access_token"
                  onChange={handleChange}
                  placeholder="LinkedIn access token"
                  required
                />
              </div>
            </>
          )}

          {formData.platform === 'twitter' && (
            <>
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="password"
                  name="cred_api_key"
                  onChange={handleChange}
                  placeholder="Twitter API key"
                  required
                />
              </div>
              <div className="form-group">
                <label>API Secret</label>
                <input
                  type="password"
                  name="cred_api_secret"
                  onChange={handleChange}
                  placeholder="Twitter API secret"
                  required
                />
              </div>
            </>
          )}

          {formData.platform === 'email' && (
            <>
              <div className="form-group">
                <label>SMTP Server</label>
                <input
                  type="text"
                  name="cred_smtp_server"
                  onChange={handleChange}
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="cred_email"
                  onChange={handleChange}
                  placeholder="your@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="cred_password"
                  onChange={handleChange}
                  placeholder="Email password"
                  required
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Connection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlatformConnections;
