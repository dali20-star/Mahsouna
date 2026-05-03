import React, { useState, useEffect } from 'react';
import '../styles/SocialMediaTimeline.css';
import PostEditor from './PostEditor';

const SocialMediaTimeline = ({ plan, onSavePlan }) => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plan && plan.posts) {
      setPosts(plan.posts);
    }
  }, [plan]);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const platformColors = {
    INSTAGRAM: '#E1306C',
    FACEBOOK: '#1877F2',
    TWITTER: '#1DA1F2',
    LINKEDIN: '#0A66C2'
  };

  const platformIcons = {
    INSTAGRAM: '📸',
    FACEBOOK: '👍',
    TWITTER: '🐦',
    LINKEDIN: '💼'
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsEditing(true);
  };

  const handleSavePost = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    setIsEditing(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleSaveAllPosts = async () => {
    setIsSaving(true);
    try {
      // This will be called by parent component
      onSavePlan(posts);
    } catch (error) {
      console.error('Error saving posts:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPostsByDay = (day) => {
    return posts.filter(post => post.day === day);
  };

  return (
    <div className="social-media-timeline">
      <div className="timeline-header">
        <h2>📱 Social Media Plan - Week Schedule</h2>
        <p className="timeline-subtitle">Click on any post to edit it</p>
      </div>

      <div className="timeline-container">
        {daysOrder.map((day, dayIndex) => {
          const dayPosts = getPostsByDay(day);
          return (
            <div key={day} className="day-column">
              <div className="day-header">
                <h3 className="day-name">{day}</h3>
                <span className="day-number">{dayIndex + 1}</span>
              </div>

              <div className="posts-container">
                {dayPosts.length > 0 ? (
                  dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className={`post-card ${post.platform.toLowerCase()} ${
                        post.is_edited ? 'edited' : ''
                      }`}
                      style={{ borderLeftColor: platformColors[post.platform] }}
                    >
                      <div className="post-header">
                        <span className="platform-icon">
                          {platformIcons[post.platform]}
                        </span>
                        <span className="platform-name">{post.platform}</span>
                        {post.is_edited && <span className="edited-badge">✏️ Edited</span>}
                      </div>

                      <div className="post-content">
                        <p className="post-caption">{post.caption}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="post-hashtags">
                            {post.hashtags.map((tag, idx) => (
                              <span key={idx} className="hashtag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="post-footer">
                        <span className="post-time">🕐 {post.time}</span>
                        <div className="post-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditPost(post)}
                            title="Edit post"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeletePost(post.id)}
                            title="Delete post"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-posts">No posts scheduled</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="timeline-footer">
        <button
          className="btn-save-all"
          onClick={handleSaveAllPosts}
          disabled={isSaving}
        >
          {isSaving ? '💾 Saving...' : '💾 Save Plan'}
        </button>
      </div>

      {isEditing && selectedPost && (
        <PostEditor
          post={selectedPost}
          onSave={handleSavePost}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default SocialMediaTimeline;
