import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SocialMediaTimeline from '../components/SocialMediaTimeline';
import '../styles/SocialMediaPlans.css';

const SocialMediaPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content/social-media-plans/');
      // Handle both array and paginated responses
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setPlans(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error loading plans:', err);
      setPlans([]);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowTimeline(true);
  };

  const handleAddNewPlan = () => {
    navigate('/content');
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/content/social-media-plans/${planId}/`);
        setSuccess('✅ Plan deleted successfully');
        fetchPlans();
        setTimeout(() => setSuccess(null), 2000);
      } catch (err) {
        setError('❌ Failed to delete plan');
        console.error(err);
      }
    }
  };

  const handleClosePlan = () => {
    setShowTimeline(false);
    setSelectedPlan(null);
  };

  const handleSavePlan = async (posts) => {
    if (!selectedPlan?.id) {
      setError('❌ No plan to save');
      return;
    }

    try {
      await api.post(`/content/social-media-plans/${selectedPlan.id}/save_plan/`, { posts });
      setSuccess('✅ Plan saved successfully!');
      fetchPlans();
      setTimeout(() => {
        handleClosePlan();
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error saving plan';
      setError('❌ ' + errorMsg);
      console.error(err);
    }
  };

  const handleSubmitForApproval = async (planId) => {
    if (window.confirm('Are you sure you want to submit this plan for manager approval?')) {
      try {
        await api.post(`/content/social-media-plans/${planId}/submit_for_approval/`);
        setSuccess('✅ Plan submitted for approval successfully!');
        fetchPlans();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Error submitting plan for approval';
        setError('❌ ' + errorMsg);
        console.error(err);
      }
    }
  };

  // Note: Plans are now automatically added to manager's approval list when created
  // No need for explicit submit action

  // Show timeline view when viewing a plan
  if (showTimeline && selectedPlan) {
    return (
      <div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="timeline-header-section">
          <h2>📱 {selectedPlan.title}</h2>
          <p className="plan-info">{selectedPlan.description}</p>
        </div>
        <SocialMediaTimeline 
          plan={selectedPlan} 
          onSavePlan={handleSavePlan}
        />
        <div className="plan-actions">
          <button 
            className="btn-back-to-plans"
            onClick={handleClosePlan}
          >
            ← Back to Plans
          </button>
        </div>
      </div>
    );
  }

  // Show plans list view
  return (
    <div className="social-media-plans-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="plans-header">
        <div className="header-content">
          <h1>📋 Social Media Plans</h1>
          <p className="subtitle">Manage your social media marketing plans</p>
        </div>
        <button 
          className="btn-add-plan"
          onClick={handleAddNewPlan}
        >
          + Add Business Plan
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading your plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Plans Yet</h3>
          <p>Create your first social media plan by clicking "+ Add Business Plan"</p>
          <button 
            className="btn-add-plan-large"
            onClick={handleAddNewPlan}
          >
            ✨ Create First Plan
          </button>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-card-header">
                <h3>{plan.title}</h3>
                <span className="plan-id">ID: {plan.id}</span>
              </div>

              <p className="plan-description">{plan.description}</p>

              <div className="plan-stats">
                <div className="stat">
                  <span className="stat-label">Posts</span>
                  <span className="stat-value">{plan.posts?.length || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Week</span>
                  <span className="stat-value">Week {plan.week_number}</span>
                </div>
              </div>

              {plan.posts && plan.posts.length > 0 && (
                <div className="platform-indicators">
                  <span className="platform-badge instagram" title="Instagram">📸</span>
                  <span className="platform-badge facebook" title="Facebook">👍</span>
                  <span className="platform-badge twitter" title="Twitter">🐦</span>
                  <span className="platform-badge linkedin" title="LinkedIn">💼</span>
                </div>
              )}

              <div className="plan-status">
                <span className={`status-badge status-${plan.status || 'draft'}`}>
                  {plan.status === 'draft' && '📝 Draft'}
                  {plan.status === 'submitted' && '⏳ Awaiting Approval'}
                  {plan.status === 'approved' && '✅ Approved'}
                  {plan.status === 'rejected' && '❌ Rejected'}
                  {plan.status === 'published' && '🚀 Published'}
                </span>
              </div>

              <div className="plan-actions">
                <button 
                  className="btn-view"
                  onClick={() => handleViewPlan(plan)}
                >
                  👁️ View Posts
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaPlans;
