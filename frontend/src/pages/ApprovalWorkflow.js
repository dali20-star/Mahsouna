import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import '../styles/ApprovalWorkflow.css';

const ApprovalWorkflow = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workflow/');
      // Handle both array and paginated responses
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setApprovals(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error loading approvals:', err);
      setApprovals([]);
      setError('Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const data = {};
      if (commentText) {
        data.comment = commentText;
      }
      await api.post(`/workflow/${selectedApproval.id}/approve/`, data);
      setCommentText('');
      setDetailsOpen(false);
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error approving content');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    try {
      await api.post(`/workflow/${selectedApproval.id}/reject/`, { 
        comment: rejectReason 
      });
      setRejectReason('');
      setRejectModalOpen(false);
      setDetailsOpen(false);
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error rejecting content');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/workflow/${selectedApproval.id}/add_comment/`, {
        comment: commentText
      });
      setCommentText('');
      // Refresh the selected approval details
      const response = await api.get(`/workflow/${selectedApproval.id}/`);
      setSelectedApproval(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding comment');
    }
  };

  if (loading) return <div className="loading">Loading approvals...</div>;

  return (
    <div className="approval-container">
      <div className="approval-header">
        <h1>Approval Workflow</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="approval-list">
        {approvals.length === 0 ? (
          <div className="empty-state">
            <p>No pending approvals</p>
          </div>
        ) : (
          approvals.map(approval => (
            <Card key={approval.id} className="approval-item">
              <div className="approval-item-header">
                <h3>{approval.content_detail?.title}</h3>
                <span className={`status-badge status-${approval.status}`}>
                  {approval.status}
                </span>
              </div>
              
              <div className="approval-creator-info">
                <p>
                  <strong>Creator:</strong> {approval.submitted_by_detail?.first_name && approval.submitted_by_detail?.last_name 
                    ? `${approval.submitted_by_detail.first_name} ${approval.submitted_by_detail.last_name}` 
                    : approval.submitted_by_detail?.username}
                </p>
                <p className="approval-meta">
                  <strong>Submitted:</strong> {new Date(approval.submitted_at).toLocaleDateString()}
                </p>
              </div>
              
              <button 
                className="btn-primary"
                onClick={() => {
                  setSelectedApproval(approval);
                  setDetailsOpen(true);
                }}
              >
                Review & Approve/Reject
              </button>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Content Review"
      >
        {selectedApproval && (
          <div className="approval-details">
            <div className="content-preview">
              <h3>{selectedApproval.content_detail?.title}</h3>
              <p className="content-type">
                Type: {selectedApproval.content_detail?.content_type}
              </p>
              <div className="content-body">
                {selectedApproval.content_detail?.body}
              </div>
            </div>

            <div className="approval-comments">
              <h4>Comments</h4>
              {selectedApproval.comments?.map(comment => (
                <div key={comment.id} className="comment">
                  <span className="comment-author">
                    {comment.user_detail?.username}
                  </span>
                  <p>{comment.comment}</p>
                </div>
              ))}

              {selectedApproval.status === 'pending' && (
                <div className="add-comment-form">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                  />
                  <button 
                    className="btn-secondary"
                    onClick={handleAddComment}
                  >
                    <FiMessageSquare /> Add Comment
                  </button>
                </div>
              )}
            </div>

            {selectedApproval.status === 'pending' && (
              <div className="approval-actions">
                <button 
                  className="btn-success"
                  onClick={handleApprove}
                >
                  <FiCheck /> Approve
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => {
                    setRejectModalOpen(true);
                  }}
                >
                  <FiX /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Content"
      >
        <div className="reject-form">
          <label>Reason for Rejection</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this content..."
            rows="4"
            required
          />
          <div className="modal-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setRejectReason('');
                setRejectModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-danger"
              onClick={handleReject}
            >
              Reject Content
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalWorkflow;
