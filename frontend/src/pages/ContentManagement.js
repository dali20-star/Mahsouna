import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';
import ContentForm from '../components/ContentForm';
import Card from '../components/Card';
import { FiEdit2, FiTrash2, FiPlus, FiSend } from 'react-icons/fi';
import '../styles/ContentManagement.css';

const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'article',
    body: '',
    description: '',
    tags: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content/');
      setContent(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        content_type: item.content_type,
        body: item.body,
        description: item.description,
        tags: item.tags,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content_type: 'article',
        body: '',
        description: '',
        tags: '',
      });
    }
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/content/${editingId}/`, data);
      } else {
        await api.post('/content/', data);
      }
      setShowForm(false);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving content');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await api.delete(`/content/${id}/`);
        fetchContent();
      } catch (err) {
        setError('Error deleting content');
      }
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await api.post(`/content/${id}/submit_for_approval/`);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error submitting content');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show form instead of list when creating/editing
  if (showForm) {
    return (
      <div className="content-container">
        <ContentForm
          onSave={handleSubmit}
          onCancel={handleFormCancel}
          initialData={formData}
          isEditing={!!editingId}
        />
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="content-header">
        <h1>Content Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> New Content
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading content...</div>}

      <div className="content-list">
        {content.map(item => (
          <Card key={item.id} className="content-item">
            <div className="content-item-header">
              <h3>{item.title}</h3>
              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </div>
            
            <p className="content-type">{item.content_type}</p>
            
            <p className="content-description">{item.description}</p>
            
            <div className="content-item-actions">
              <button 
                className="btn-secondary"
                onClick={() => handleOpenModal(item)}
              >
                <FiEdit2 /> Edit
              </button>
              
              <button 
                className="btn-danger"
                onClick={() => handleDelete(item.id)}
              >
                <FiTrash2 /> Delete
              </button>
              
              {item.status === 'draft' && (
                <button 
                  className="btn-success"
                  onClick={() => handleSubmitForApproval(item.id)}
                >
                  <FiSend /> Submit for Approval
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;
