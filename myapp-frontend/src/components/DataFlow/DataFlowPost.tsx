const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import type { DataFlow, CommentRequest, ReportRequest } from './types';
import DataFlowThread from './DataFlowThread';

interface DataFlowPostProps {
  post: DataFlow;
  onPostDeleted: () => void;
  onCommentAdded: () => void;
}

const DataFlowPost: React.FC<DataFlowPostProps> = ({ post, onPostDeleted, onCommentAdded }) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [comment, setComment] = useState('');
  const [charCount, setCharCount] = useState(100);

  // Mock user authentication - you'll need to implement real auth
  const currentUserId = 1; // This should come from your auth context
  const isOwner = post.userId === currentUserId;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reportData: ReportRequest = {
      reportedUserId: post.userId,
      dataFlowId: post.id,
      dataFlowText: post.content,
      reason: reportReason
    };

    try {
      const response = await fetch(`${API_URL}/home/ReportDataFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        alert('Report submitted successfully');
        setShowReportForm(false);
        setReportReason('');
      } else {
        alert('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const commentData: CommentRequest = {
      dataFlowId: post.id,
      comment: comment
    };

    try {
      const response = await fetch(`${API_URL}/home/CommentOnDataFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        setComment('');
        onCommentAdded(); // Refresh the data
      } else {
        alert('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`${API_URL}/home/Delete/${post.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          onPostDeleted();
        } else {
          alert('Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
      }
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setReportReason(value);
      setCharCount(100 - value.length);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      marginBottom: '15px',
      backgroundColor: '#fff'
    }}>
      <div>
        <p>
          <strong>{post.user?.email || 'Unknown'}</strong><br />
          {post.content}
        </p>
        
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => setShowReportForm(!showReportForm)}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Report
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Comments
          </button>

          {isOwner && (
            <button 
              onClick={handleDelete}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          )}
        </div>

        {/* Report Form */}
        {showReportForm && (
          <form onSubmit={handleReportSubmit} style={{ marginTop: '10px' }}>
            <textarea
              value={reportReason}
              onChange={handleReasonChange}
              placeholder="Ange anledning (max 100 tecken)"
              style={{
                width: '200px',
                display: 'inline-block',
                marginBottom: '5px',
                padding: '5px'
              }}
            />
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              <span>{charCount}</span> tecken kvar
            </div>
            <button 
              type="submit"
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Skicka rapport
            </button>
          </form>
        )}

        {/* Comments Section */}
        {showComments && (
          <div style={{ marginTop: '10px' }}>
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '15px' }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '5px',
                  marginBottom: '5px'
                }}
              />
              <button 
                type="submit"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Comment
              </button>
            </form>

            {/* Render Comments/Replies */}
            {post.relatedDataFlows && post.relatedDataFlows.length > 0 && (
              <div>
                {post.relatedDataFlows.map(reply => (
                  <DataFlowThread 
                    key={reply.id} 
                    dataFlow={reply} 
                    onCommentAdded={onCommentAdded}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFlowPost;