const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import type { DataFlow, CommentRequest } from './types';

interface DataFlowThreadProps {
  dataFlow: DataFlow;
  onCommentAdded: () => void;
}

const DataFlowThread: React.FC<DataFlowThreadProps> = ({ dataFlow, onCommentAdded }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [reply, setReply] = useState('');

  // Mock user authentication - you'll need to implement real auth
  const currentUserId = 1; // This should come from your auth context
  const isOwner = dataFlow.userId === currentUserId;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const replyData: CommentRequest = {
      dataFlowId: dataFlow.id,
      comment: reply
    };

    try {
      const response = await fetch(`${API_URL}/home/CommentOnDataFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(replyData)
      });

      if (response.ok) {
        setReply('');
        setShowReplyForm(false);
        onCommentAdded(); // Refresh the data
      } else {
        alert('Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Error adding reply');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await fetch(`${API_URL}/home/Delete/${dataFlow.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          onCommentAdded(); // Refresh the data
        } else {
          alert('Failed to delete comment');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment');
      }
    }
  };

  return (
    <div style={{ 
      marginLeft: dataFlow.parentDataFlowId ? '30px' : '0',
      borderLeft: dataFlow.parentDataFlowId ? '2px solid #e9ecef' : 'none',
      paddingLeft: dataFlow.parentDataFlowId ? '15px' : '0',
      marginTop: '10px'
    }}>
      <div>
        <strong>{dataFlow.user?.email || 'Unknown'}</strong>{' '}
        {dataFlow.content}{' '}
        ({new Date(dataFlow.createdAt).toLocaleString()})
        
        {/* Reply toggle link */}
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Reply
        </button>

        {/* Delete button, only visible to the owner */}
        {isOwner && (
          <button 
            onClick={handleDelete}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '4px',
              marginLeft: '10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        )}

        {/* Reply form (hidden by default) */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} style={{ marginTop: '10px' }}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply..."
              style={{
                width: '100%',
                minHeight: '50px',
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
              Reply
            </button>
          </form>
        )}
      </div>

      {/* Render nested replies */}
      {dataFlow.relatedDataFlows && dataFlow.relatedDataFlows.length > 0 && (
        <div>
          {dataFlow.relatedDataFlows.map(nestedReply => (
            <DataFlowThread 
              key={nestedReply.id} 
              dataFlow={nestedReply} 
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DataFlowThread;