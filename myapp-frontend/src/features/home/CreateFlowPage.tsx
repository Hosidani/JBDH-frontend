const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import type { CreateFlowRequest } from '../../types/DataFlow';

interface CreateFlowPageProps {
  onNavigateBack?: () => void;
}

const CreateFlowPage: React.FC<CreateFlowPageProps> = ({ onNavigateBack }) => {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'video' | 'link'>('text');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    setLoading(true);
    
    const flowData: CreateFlowRequest = {
      content: content.trim(),
      contentType: contentType
    };

    try {
      const response = await fetch(`${API_URL}/api/home/CreateFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flowData)
      });

      if (response.ok) {
        // Navigate back to home page after successful creation
        if (onNavigateBack) {
          onNavigateBack();
        } else {
          // Fallback: reload the page
          window.location.href = '/';
        }
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      // Fallback: go back in history
      window.history.back();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Create new post</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Typ:</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as 'text' | 'image' | 'video' | 'link')}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '200px'
            }}
          >
            <option value="text">Text</option>
            <option value="image">Picture</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Innehåll:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your post content..."
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          
          <button 
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFlowPage;