import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { FiPlus, FiX, FiClock } from 'react-icons/fi';
import '../styles/PublishingScheduler.css';

const PublishingScheduler = () => {
  const [schedules, setSchedules] = useState([]);
  const [content, setContent] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    content_id: '',
    platform_account_id: '',
    scheduled_time: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, contentRes, platformsRes] = await Promise.all([
        api.get('/scheduler/'),
        api.get('/content/?status=approved'),
        api.get('/platforms/accounts/'),
      ]);
      // Safely handle both array and paginated responses
      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : (schedulesRes.data.results || []);
      const contentData = Array.isArray(contentRes.data) ? contentRes.data : (contentRes.data.results || []);
      const platformsData = Array.isArray(platformsRes.data) ? platformsRes.data : (platformsRes.data.results || []);
      
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setContent(Array.isArray(contentData) ? contentData : []);
      setPlatforms(Array.isArray(platformsData) ? platformsData : []);
    } catch (err) {
      setError('Failed to fetch data');
      // Initialize with empty arrays on error
      setSchedules([]);
      setContent([]);
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scheduler/schedule_content/', formData);
      setModalOpen(false);
      setFormData({ content_id: '', platform_account_id: '', scheduled_time: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error scheduling content');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this publication?')) {
      try {
        await api.post(`/scheduler/${id}/cancel/`);
        fetchData();
      } catch (err) {
        setError('Error cancelling publication');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <div className="loading">Loading schedules...</div>;

  return (
    <div className="scheduler-container">
      <div className="scheduler-header">
        <h1>Publishing Scheduler</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Schedule Publication
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="schedules-grid">
        {schedules.map(schedule => (
          <Card key={schedule.id} className="schedule-card">
            <div className="schedule-card-header">
              <h3>{schedule.content_detail?.title}</h3>
              <span className={`status-badge status-${schedule.status}`}>
                {schedule.status}
              </span>
            </div>
            
            <div className="schedule-info">
              <p>
                <FiClock /> {new Date(schedule.scheduled_time).toLocaleString()}
              </p>
              <p>Platform: <strong>{schedule.platform_detail?.account_name}</strong></p>
            </div>
            
            {schedule.status === 'scheduled' && (
              <button 
                className="btn-danger btn-small"
                onClick={() => handleCancel(schedule.id)}
              >
                <FiX /> Cancel
              </button>
            )}
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Publication"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Content</label>
            <select 
              name="content_id" 
              value={formData.content_id} 
              onChange={handleChange}
              required
            >
              <option value="">Select content to publish</option>
              {content.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Platform</label>
            <select 
              name="platform_account_id" 
              value={formData.platform_account_id} 
              onChange={handleChange}
              required
            >
              <option value="">Select platform</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.account_name} ({platform.platform})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Scheduled Time</label>
            <input
              type="datetime-local"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PublishingScheduler;
