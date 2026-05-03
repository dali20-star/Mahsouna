import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BusinessInfo from '../components/BusinessInfo';
import SocialMediaTimeline from '../components/SocialMediaTimeline';
import '../styles/BusinessInfo.css';

const BusinessInformationPage = () => {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load existing business info on mount
  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const response = await api.get('/content/business-info/my_business/');
      setBusinessData(response.data);
    } catch (err) {
      console.log('No business info found');
    }
  };

  const handleBusinessInfoSave = async (data) => {
    setError(null);
    setSuccess(null);
    try {
      if (businessData?.id) {
        // Update existing
        await api.put(`/content/business-info/${businessData.id}/`, data);
      } else {
        // Create new
        await api.post('/content/business-info/', data);
      }
      fetchBusinessInfo();
      setSuccess('✅ Business info saved successfully! Click "Generate Plan" to create social media posts.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error saving business info';
      setError('❌ ' + errorMsg);
      console.error('Error saving business info:', err.response?.data || err.message);
    }
  };

  const handleGeneratePlan = async () => {
    if (!businessData?.id) {
      setError('❌ Please save your business information first');
      return;
    }

    setLoadingPlan(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post('/content/business-info/generate_plan/', {});
      setPlan(response.data.data);
      setShowTimeline(true);
      setSuccess('✅ Social media plan generated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error generating plan';
      setError('❌ ' + errorMsg);
      console.error('Error generating plan:', err.response?.data || err.message);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSavePlan = async (posts) => {
    if (!plan?.id) {
      setError('❌ No plan to save');
      return;
    }

    setLoadingPlan(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/content/social-media-plans/${plan.id}/save_plan/`, { posts });
      setSuccess('✅ Plan saved successfully! Redirecting to your plans...');
      setTimeout(() => {
        navigate('/plans');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error saving plan';
      setError('❌ ' + errorMsg);
      console.error('Error saving plan:', err.response?.data || err.message);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Show timeline if plan exists
  if (showTimeline && plan) {
    return (
      <div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <SocialMediaTimeline 
          plan={plan} 
          onSavePlan={handleSavePlan}
        />
        <div className="timeline-actions">
          <button 
            className="btn-back-to-form"
            onClick={() => setShowTimeline(false)}
          >
            ← Back to Business Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="business-info-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <BusinessInfo 
        onSave={handleBusinessInfoSave}
        initialData={businessData}
      />

      {businessData && (
        <div className="generate-plan-section">
          <button
            className="btn-generate-plan"
            onClick={handleGeneratePlan}
            disabled={loadingPlan}
          >
            {loadingPlan ? '⏳ Generating Plan...' : '✨ Generate Social Media Plan'}
          </button>
          <p className="plan-description">
            Click the button above to generate a week-long social media plan using AI
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessInformationPage;
