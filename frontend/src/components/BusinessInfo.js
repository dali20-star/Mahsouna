import React, { useState } from 'react';
import '../styles/BusinessInfo.css';

const BusinessInfo = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    business_name: '',
    industry: '',
    target_audience: [],
    goals: [],
    description: '',
    plan_duration: '7',
    platforms: []
  });

  const [inputTags, setInputTags] = useState({
    audience: '',
    goals: ''
  });

  const industries = [
    'Technology',
    'Finance & Banking',
    'Healthcare & Wellness',
    'Fitness & Wellness',
    'E-Commerce',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Entertainment',
    'Media & Publishing',
    'Non-Profit',
    'Other'
  ];

  const durationOptions = [
    { value: '3', label: '3 days' },
    { value: '4', label: '4 days' },
    { value: '5', label: '5 days' },
    { value: '6', label: '6 days' },
    { value: '7', label: '1 week (7 days)' },
    { value: '14', label: '2 weeks (14 days)' },
    { value: '30', label: '1 month (30 days)' }
  ];

  const platformOptions = [
    { value: 'facebook', label: '📘 Facebook' },
    { value: 'instagram', label: '📷 Instagram' },
    { value: 'twitter', label: '𝕏 Twitter' },
    { value: 'linkedin', label: '💼 LinkedIn' },
    { value: 'tiktok', label: '🎵 TikTok' },
    { value: 'youtube', label: '📺 YouTube' },
    { value: 'snapchat', label: '👻 Snapchat' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInput = (e, field) => {
    const { value } = e.target;
    setInputTags(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (field) => {
    const value = inputTags[field].trim();
    if (value && !formData[field === 'audience' ? 'target_audience' : 'goals'].includes(value)) {
      const fieldName = field === 'audience' ? 'target_audience' : 'goals';
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], value]
      }));
      setInputTags(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const removeTag = (field, index) => {
    const fieldName = field === 'audience' ? 'target_audience' : 'goals';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handlePlatformChange = (platform) => {
    setFormData(prev => {
      const platforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      return {
        ...prev,
        platforms
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="business-info-container">
      <div className="business-info-header">
        <h2>Tell us about your business</h2>
        <p className="step-indicator">Step 1 of 2</p>
        <p className="business-info-subtitle">
          Provide some information about your business or startup to help us create relevant social media plans tailored to your needs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="business-info-form">
        
        {/* Business Name */}
        <div className="form-group">
          <label htmlFor="business_name" className="form-label">Business Name</label>
          <input
            type="text"
            id="business_name"
            name="business_name"
            className="form-input"
            placeholder="Enter your business name"
            value={formData.business_name}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Industry */}
        <div className="form-group">
          <label htmlFor="industry" className="form-label">Industry</label>
          <select
            id="industry"
            name="industry"
            className="form-select"
            value={formData.industry}
            onChange={handleInputChange}
            required
          >
            <option value="">Select an industry</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Target Audience */}
        <div className="form-group">
          <label htmlFor="target_audience" className="form-label">Target Audience</label>
          <div className="tags-input-wrapper">
            <div className="tags-display">
              {formData.target_audience.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag('audience', index)}
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="tags-input"
              placeholder="Add tag to..."
              value={inputTags.audience}
              onChange={(e) => handleTagInput(e, 'audience')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('audience');
                }
              }}
            />
          </div>
        </div>

        {/* Goals */}
        <div className="form-group">
          <label htmlFor="goals" className="form-label">Goals</label>
          <div className="tags-input-wrapper">
            <div className="tags-display">
              {formData.goals.map((goal, index) => (
                <span key={index} className="tag-chip tag-goal">
                  {goal}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag('goals', index)}
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="tags-input"
              placeholder="Add tag to..."
              value={inputTags.goals}
              onChange={(e) => handleTagInput(e, 'goals')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('goals');
                }
              }}
            />
          </div>
        </div>

        {/* Business Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Business Description</label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Describe your business..."
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            required
          />
        </div>

        {/* Plan Duration */}
        <div className="form-group">
          <label htmlFor="plan_duration" className="form-label">Plan Duration</label>
          <select
            id="plan_duration"
            name="plan_duration"
            className="form-select"
            value={formData.plan_duration}
            onChange={handleInputChange}
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Platforms */}
        <div className="form-group">
          <label className="form-label">Select Platforms</label>
          <p className="platforms-helper">Choose which platforms to create content for</p>
          <div className="platforms-grid">
            {platformOptions.map(platform => (
              <label key={platform.value} className="platform-checkbox">
                <input
                  type="checkbox"
                  checked={formData.platforms.includes(platform.value)}
                  onChange={() => handlePlatformChange(platform.value)}
                />
                <span className="platform-label">{platform.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Next: Generate Plan →
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessInfo;
