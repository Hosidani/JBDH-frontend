import React, { useState } from 'react';
import type { CreateFlowRequest } from '../../components/DataFlow/types';
import { useTranslation } from '../../hooks/TranslationProvider';

interface CreateFlowPageProps {
  onNavigateBack?: () => void;
}

const CreateFlowPage: React.FC<CreateFlowPageProps> = ({ onNavigateBack }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  console.log('🔍 CreateFlowPage API_URL:', API_URL);
  
  const { tSync } = useTranslation();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'video' | 'link'>('text');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert(tSync('createFlowPage_alert_enter_content'));
      return;
    }
    setLoading(true);
    const flowData: CreateFlowRequest = {
      content: content.trim(),
      contentType: contentType
    };
    try {
      const response = await fetch(`${API_URL}/home/CreateFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flowData)
      });
      if (response.ok) {
        if (onNavigateBack) {
          onNavigateBack();
        } else {
          window.location.href = '/';
        }
      } else {
        alert(tSync('createFlowPage_alert_failed_create'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert(tSync('createFlowPage_alert_error_create'));
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
      <h2>{tSync('createFlowPage_title')}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>{tSync('createFlowPage_type_label')}</label>
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
            <option value="text">{tSync('createFlowPage_type_text')}</option>
            <option value="image">{tSync('createFlowPage_type_image')}</option>
            <option value="video">{tSync('createFlowPage_type_video')}</option>
            <option value="link">{tSync('createFlowPage_type_link')}</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>{tSync('createFlowPage_content_label')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={tSync('createFlowPage_content_placeholder')}
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
            {loading ? tSync('createFlowPage_submitting') : tSync('createFlowPage_submit')}
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
            {tSync('createFlowPage_cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFlowPage;
