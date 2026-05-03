import React, { useState } from 'react';
import '../styles/BusinessInformationForm.css';

const BusinessInformationForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    target_audience: '',
    goals: [],
    business_description: '',
  });

  const industriesOptions = [
    'Technology',
    'Healthcare',
    'Retail',
    'Finance',
    'Education',
    'Entertainment',
    'Other',
  ];

  const goalsOptions = [
    'Increase Brand Awareness',
    'Drive Sales',
    'Build Community',
    'Generate Leads',
    'Educate Audience',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoalToggle = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="business-form-container">
      <div className="form-header">
        <span className="step-badge">Step 1 of 2</span>
        <h1>Business Information</h1>
        <p className="form-subtitle">Tell us about your business</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Business Name */}
        <div className="form-field">
          <label htmlFor="business_name">Business Name</label>
          <input
            id="business_name"
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            placeholder="Enter business name"
            required
          />
        </div>

        {/* Industry */}
        <div className="form-field">
          <label htmlFor="industry">Industry</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
          >
            <option value="">Select industry</option>
            {industriesOptions.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Target Audience */}
        <div className="form-field">
          <label htmlFor="target_audience">Target Audience</label>
          <input
            id="target_audience"
            type="text"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            placeholder="e.g., Young professionals, Students"
            required
          />
        </div>

        {/* Goals */}
        <div className="form-field goals-field">
          <label>Goals (Select multiple)</label>
          <div className="goals-grid">
            {goalsOptions.map((goal) => (
              <label key={goal} className="goal-checkbox">
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                />
                <span>{goal}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Business Description */}
        <div className="form-field">
          <label htmlFor="business_description">Business Description</label>
          <textarea
            id="business_description"
            name="business_description"
            value={formData.business_description}
            onChange={handleChange}
            placeholder="Brief description of your business"
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Generating Plan...' : 'Generate Plan'}
        </button>
      </form>
    </div>
  );
};

export default BusinessInformationForm;
