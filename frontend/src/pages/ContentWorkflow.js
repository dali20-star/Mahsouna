import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/ContentWorkflow.css';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';

const ContentWorkflow = () => {
  const [workflowData, setWorkflowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContentWorkflow();
  }, []);

  const fetchContentWorkflow = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content/business-info/admin_content_workflow/');
      setWorkflowData(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching content workflow:', err);
      setError('Failed to load content workflow');
      setWorkflowData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on status and search term
  const filteredData = workflowData.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = 
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Group by status
  const pendingContent = filteredData.filter(item => item.status === 'draft');
  const approvedContent = filteredData.filter(item => item.status === 'approved');
  const rejectedContent = filteredData.filter(item => item.status === 'rejected');

  const getStatusBadge = (status) => {
    switch(status) {
      case 'draft':
        return <span className="status-badge status-draft">Pending</span>;
      case 'approved':
        return <span className="status-badge status-approved">Approved</span>;
      case 'rejected':
        return <span className="status-badge status-rejected">Rejected</span>;
      case 'published':
        return <span className="status-badge status-published">Published</span>;
      case 'submitted':
        return <span className="status-badge status-submitted">Submitted</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'instagram':
        return '📷';
      case 'facebook':
        return '👍';
      case 'twitter':
        return '𝕏';
      case 'linkedin':
        return '💼';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '📺';
      default:
        return '📱';
    }
  };

  if (loading) {
    return (
      <div className="content-workflow-page">
        <div className="loading-state">Loading content workflow...</div>
      </div>
    );
  }

  return (
    <div className="content-workflow-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="workflow-header">
        <div className="header-content">
          <h1>📊 Content Workflow</h1>
          <p className="subtitle">Monitor all business content and approvals</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{workflowData.length}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pendingContent.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{approvedContent.length}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
      </div>

      <div className="workflow-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, business, or creator..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({workflowData.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'draft' ? 'active' : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Pending ({pendingContent.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved ({approvedContent.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected ({rejectedContent.length})
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="empty-state">
          <p>No content items found</p>
        </div>
      ) : (
        <div className="workflow-sections">
          {/* Pending Review Section */}
          {pendingContent.length > 0 && (
            <div className="workflow-section">
              <div className="section-header">
                <h2 className="section-title">⏳ Pending Review</h2>
                <span className="section-count">{pendingContent.length} items</span>
              </div>
              <div className="content-grid">
                {pendingContent.map((item) => (
                  <div key={item.id} className="content-card">
                    <div className="card-header">
                      <div className="platform-badge">
                        {getPlatformIcon(item.platform)} {item.platform}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-business">Business: {item.business_name}</p>
                    <p className="card-creator">Creator: {item.creator}</p>
                    <div className="card-meta">
                      <span>Day: {item.day}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="card-actions">
                      <button className="btn-view">
                        <FiEye size={16} /> View
                      </button>
                      <button className="btn-approve">
                        <FiCheck size={16} /> Approve
                      </button>
                      <button className="btn-reject">
                        <FiX size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Section */}
          {approvedContent.length > 0 && (
            <div className="workflow-section">
              <div className="section-header">
                <h2 className="section-title">✅ Approved</h2>
                <span className="section-count">{approvedContent.length} items</span>
              </div>
              <div className="content-grid">
                {approvedContent.map((item) => (
                  <div key={item.id} className="content-card approved">
                    <div className="card-header">
                      <div className="platform-badge">
                        {getPlatformIcon(item.platform)} {item.platform}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-business">Business: {item.business_name}</p>
                    <p className="card-creator">Creator: {item.creator}</p>
                    <div className="card-meta">
                      <span>Day: {item.day}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="card-actions">
                      <button className="btn-view">
                        <FiEye size={16} /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Section */}
          {rejectedContent.length > 0 && (
            <div className="workflow-section">
              <div className="section-header">
                <h2 className="section-title">❌ Rejected</h2>
                <span className="section-count">{rejectedContent.length} items</span>
              </div>
              <div className="content-grid">
                {rejectedContent.map((item) => (
                  <div key={item.id} className="content-card rejected">
                    <div className="card-header">
                      <div className="platform-badge">
                        {getPlatformIcon(item.platform)} {item.platform}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-business">Business: {item.business_name}</p>
                    <p className="card-creator">Creator: {item.creator}</p>
                    <div className="card-meta">
                      <span>Day: {item.day}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="card-actions">
                      <button className="btn-view">
                        <FiEye size={16} /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentWorkflow;
