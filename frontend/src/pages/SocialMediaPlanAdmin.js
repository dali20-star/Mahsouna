import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/SocialMediaPlanAdmin.css';
import { FiEye, FiCheck, FiX, FiFilter } from 'react-icons/fi';

const SocialMediaPlanAdmin = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content/social-media-plans/');
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load social media plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredPlans = plans.filter(plan => {
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesSearch = 
      searchTerm === '' ||
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Group by status
  const draftPlans = filteredPlans.filter(p => p.status === 'draft');
  const submittedPlans = filteredPlans.filter(p => p.status === 'submitted');
  const approvedPlans = filteredPlans.filter(p => p.status === 'approved');
  const publishedPlans = filteredPlans.filter(p => p.status === 'published');

  const getStatusBadge = (status) => {
    switch(status) {
      case 'draft':
        return <span className="status-badge status-draft">Draft</span>;
      case 'submitted':
        return <span className="status-badge status-submitted">Submitted</span>;
      case 'approved':
        return <span className="status-badge status-approved">Approved</span>;
      case 'published':
        return <span className="status-badge status-published">Published</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const handleApprove = async (planId) => {
    if (window.confirm('Are you sure you want to approve this plan?')) {
      try {
        await api.patch(`/content/social-media-plans/${planId}/`, { status: 'approved' });
        setSuccess('✅ Plan approved successfully!');
        fetchAllPlans();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('❌ Failed to approve plan');
        console.error(err);
      }
    }
  };

  const handleReject = async (planId) => {
    if (window.confirm('Are you sure you want to reject this plan?')) {
      try {
        await api.patch(`/content/social-media-plans/${planId}/`, { status: 'rejected' });
        setSuccess('✅ Plan rejected');
        fetchAllPlans();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('❌ Failed to reject plan');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="social-media-plan-admin-page">
        <div className="loading-state">Loading social media plans...</div>
      </div>
    );
  }

  return (
    <div className="social-media-plan-admin-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="plan-admin-header">
        <div className="header-content">
          <h1>📱 Social Media Plans</h1>
          <p className="subtitle">Manage all social media plans</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{plans.length}</span>
            <span className="stat-label">Total Plans</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{draftPlans.length}</span>
            <span className="stat-label">Draft</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{submittedPlans.length}</span>
            <span className="stat-label">Submitted</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{approvedPlans.length}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{publishedPlans.length}</span>
            <span className="stat-label">Published</span>
          </div>
        </div>
      </div>

      <div className="plan-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({plans.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'draft' ? 'active' : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Draft ({draftPlans.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'submitted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('submitted')}
          >
            Submitted ({submittedPlans.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved ({approvedPlans.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'published' ? 'active' : ''}`}
            onClick={() => setFilterStatus('published')}
          >
            Published ({publishedPlans.length})
          </button>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="empty-state">
          <p>No social media plans found</p>
        </div>
      ) : (
        <>
          {/* Recent Social Media Plans Section */}
          <div className="recent-content-section">
            <h2 className="recent-content-title">Recent Social Media Plans</h2>
            <div className="recent-content-list">
              {plans.slice(0, 5).map((plan) => (
                <div key={plan.id} className="recent-content-item">
                  <span className="recent-content-title-text">{plan.title}</span>
                  {getStatusBadge(plan.status)}
                </div>
              ))}
            </div>
          </div>

          <div className="plan-sections">
          {/* Submitted Section */}
          {submittedPlans.length > 0 && (
            <div className="plan-section">
              <div className="section-header">
                <h2 className="section-title">⏳ Pending Review</h2>
                <span className="section-count">{submittedPlans.length} plans</span>
              </div>
              <div className="plans-grid">
                {submittedPlans.map((plan) => (
                  <div key={plan.id} className="plan-card">
                    <div className="card-top">
                      <h3 className="plan-title">{plan.title}</h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-meta">
                      <span>Week {plan.week_number}</span>
                      <span>•</span>
                      <span>{plan.posts?.length || 0} posts</span>
                    </div>
                    <div className="plan-actions">
                      <button className="btn-view" onClick={() => navigate(`/plans`)}>
                        <FiEye size={16} /> View
                      </button>
                      <button className="btn-approve" onClick={() => handleApprove(plan.id)}>
                        <FiCheck size={16} /> Approve
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(plan.id)}>
                        <FiX size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draft Section */}
          {draftPlans.length > 0 && (
            <div className="plan-section">
              <div className="section-header">
                <h2 className="section-title">📝 Draft Plans</h2>
                <span className="section-count">{draftPlans.length} plans</span>
              </div>
              <div className="plans-grid">
                {draftPlans.map((plan) => (
                  <div key={plan.id} className="plan-card">
                    <div className="card-top">
                      <h3 className="plan-title">{plan.title}</h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-meta">
                      <span>Week {plan.week_number}</span>
                      <span>•</span>
                      <span>{plan.posts?.length || 0} posts</span>
                    </div>
                    <div className="plan-actions">
                      <button className="btn-view" onClick={() => navigate(`/plans`)}>
                        <FiEye size={16} /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Section */}
          {approvedPlans.length > 0 && (
            <div className="plan-section">
              <div className="section-header">
                <h2 className="section-title">✅ Approved</h2>
                <span className="section-count">{approvedPlans.length} plans</span>
              </div>
              <div className="plans-grid">
                {approvedPlans.map((plan) => (
                  <div key={plan.id} className="plan-card approved">
                    <div className="card-top">
                      <h3 className="plan-title">{plan.title}</h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-meta">
                      <span>Week {plan.week_number}</span>
                      <span>•</span>
                      <span>{plan.posts?.length || 0} posts</span>
                    </div>
                    <div className="plan-actions">
                      <button className="btn-view" onClick={() => navigate(`/plans`)}>
                        <FiEye size={16} /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published Section */}
          {publishedPlans.length > 0 && (
            <div className="plan-section">
              <div className="section-header">
                <h2 className="section-title">🚀 Published</h2>
                <span className="section-count">{publishedPlans.length} plans</span>
              </div>
              <div className="plans-grid">
                {publishedPlans.map((plan) => (
                  <div key={plan.id} className="plan-card published">
                    <div className="card-top">
                      <h3 className="plan-title">{plan.title}</h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-meta">
                      <span>Week {plan.week_number}</span>
                      <span>•</span>
                      <span>{plan.posts?.length || 0} posts</span>
                    </div>
                    <div className="plan-actions">
                      <button className="btn-view" onClick={() => navigate(`/plans`)}>
                        <FiEye size={16} /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
};

export default SocialMediaPlanAdmin;
