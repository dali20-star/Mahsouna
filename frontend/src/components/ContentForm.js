import React, { useState } from 'react';
import '../styles/ContentForm.css';

const ContentForm = ({ onSave, onCancel, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    content_type: 'article',
    body: '',
    description: '',
    tags: ''
  });

  const contentTypes = [
    { value: 'article', label: 'Article' },
    { value: 'blog_post', label: 'Blog Post' },
    { value: 'social_media', label: 'Social Media Post' },
    { value: 'email', label: 'Email' },
    { value: 'video_script', label: 'Video Script' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="content-form-container">
      <div className="content-form-header">
        <h2>{isEditing ? 'Edit Content' : 'Create New Content'}</h2>
        {!isEditing && (
          <p className="content-form-subtitle">
            Write and format your content, then submit it for approval.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="content-form">
        
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-input"
            placeholder="Enter content title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Content Type */}
        <div className="form-group">
          <label htmlFor="content_type" className="form-label">Content Type</label>
          <select
            id="content_type"
            name="content_type"
            className="form-select"
            value={formData.content_type}
            onChange={handleChange}
          >
            {contentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            className="form-input"
            placeholder="Brief description of the content"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Body Content */}
        <div className="form-group">
          <label htmlFor="body" className="form-label">Content</label>
          <textarea
            id="body"
            name="body"
            className="form-textarea"
            placeholder="Write your content here..."
            value={formData.body}
            onChange={handleChange}
            rows={10}
            required
          />
          <p className="form-help-text">{formData.body.length} characters</p>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="form-input"
            placeholder="Comma-separated tags (e.g. marketing, social, business)"
            value={formData.tags}
            onChange={handleChange}
          />
          <p className="form-help-text">Press enter or comma to add tags</p>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
          >
            {isEditing ? 'Update Content' : 'Create Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;
