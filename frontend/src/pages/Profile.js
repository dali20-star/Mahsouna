import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Profile.css';
import { FiEdit2, FiCamera, FiLogOut } from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    profile_image: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile/');
      setUser(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        bio: response.data.bio || '',
        profile_image: null,
      });
      if (response.data.profile_image) {
        setPhotoPreview(response.data.profile_image);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('bio', formData.bio);
      if (formData.profile_image) {
        submitData.append('profile_image', formData.profile_image);
      }

      const response = await api.patch('/users/profile/update_profile/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setEditing(false);
      setSuccess('✅ Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <div className="profile-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-container">
        {/* Header with logout button */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            Logout
          </button>
        </div>

        {/* Cover Photo Area */}
        <div className="profile-cover">
          <div className="cover-placeholder"></div>
        </div>

        {/* Main Profile Card */}
        <div className="profile-card">
          {/* Profile Photo Section (Like Facebook) */}
          <div className="profile-photo-section">
            <div className="profile-photo-container">
              {photoPreview ? (
                <img src={photoPreview} alt={user.username} className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">
                  <FiCamera size={40} />
                </div>
              )}
              {editing && (
                <label className="photo-upload-overlay">
                  <FiCamera size={24} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
              )}
            </div>

            {!editing && (
              <button 
                className="btn-edit"
                onClick={() => setEditing(true)}
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="profile-info">
            {editing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Write something about yourself..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-display">
                <div className="profile-name">
                  <h2>{user.first_name} {user.last_name}</h2>
                  <p className="username">@{user.username}</p>
                </div>

                <div className="profile-details">
                  <div className="detail-item">
                    <label>Email:</label>
                    <p className="email-display">{user.email}</p>
                  </div>

                  <div className="detail-item">
                    <label>Password:</label>
                    <p className="password-display">••••••••</p>
                    <small className="password-note">(Password is securely encrypted)</small>
                  </div>

                  <div className="detail-item">
                    <label>Bio:</label>
                    <p className="bio-display">{user.bio || 'No bio added yet'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Role:</label>
                    <p className="role-badge">👤 {user.role === 'creator' ? 'Content Creator' : user.role}</p>
                  </div>

                  <div className="detail-item">
                    <label>Member Since:</label>
                    <p>{new Date(user.date_joined).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Profile;
