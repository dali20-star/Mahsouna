import React, { useState } from 'react';
import '../styles/PostEditor.css';

const PostEditor = ({ post, onSave, onClose }) => {
  const [caption, setCaption] = useState(post.caption || '');
  const [hashtags, setHashtags] = useState((post.hashtags || []).join(' '));
  const [time, setTime] = useState(post.time || '09:00:00');
  const [charCount, setCharCount] = useState(post.caption?.length || 0);

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    setCaption(value);
    setCharCount(value.length);
  };

  const handleHashtagsChange = (e) => {
    setHashtags(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleSave = () => {
    const hashtagsArray = hashtags
      .split(' ')
      .filter(tag => tag.trim().length > 0)
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`));

    const updatedPost = {
      ...post,
      caption,
      hashtags: hashtagsArray,
      time,
      is_edited: true
    };

    onSave(updatedPost);
  };

  const platformCharLimit = {
    TWITTER: 280,
    INSTAGRAM: 2200,
    FACEBOOK: 63206,
    LINKEDIN: 3000
  };

  const limit = platformCharLimit[post.platform] || 2200;
  const isOverLimit = charCount > limit;

  return (
    <div className="post-editor-overlay">
      <div className="post-editor-modal">
        <div className="editor-header">
          <h3>Edit {post.platform} Post</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="editor-content">
          {/* Platform Info */}
          <div className="platform-info">
            <span className="platform-badge">{post.platform}</span>
            <span className="day-info">{post.day}</span>
          </div>

          {/* Caption */}
          <div className="form-group">
            <label htmlFor="caption">Caption</label>
            <textarea
              id="caption"
              value={caption}
              onChange={handleCaptionChange}
              placeholder="Enter your post caption..."
              rows={6}
              className={isOverLimit ? 'over-limit' : ''}
            />
            <div className="char-count">
              <span className={isOverLimit ? 'warning' : ''}>
                {charCount} / {limit} characters
              </span>
              {isOverLimit && (
                <span className="warning-text">⚠️ Over character limit for {post.platform}</span>
              )}
            </div>
          </div>

          {/* Time */}
          <div className="form-group">
            <label htmlFor="time">Post Time</label>
            <input
              id="time"
              type="time"
              value={time.slice(0, 5)}
              onChange={handleTimeChange}
            />
          </div>

          {/* Hashtags */}
          <div className="form-group">
            <label htmlFor="hashtags">Hashtags</label>
            <input
              id="hashtags"
              type="text"
              value={hashtags}
              onChange={handleHashtagsChange}
              placeholder="Enter hashtags separated by spaces (e.g., #marketing #business)"
            />
            <div className="hashtags-preview">
              {hashtags.split(' ').filter(tag => tag.trim().length > 0).map((tag, idx) => (
                <span key={idx} className="hashtag-chip">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isOverLimit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
