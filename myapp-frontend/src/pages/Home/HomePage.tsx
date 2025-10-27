import React, { useState, useEffect } from 'react';
import type { ListDataFlowViewModel } from '../../types/DataFlow';
import { DataFlowPost, CreateFlowForm, CvJobAdComparison } from '../../components';

const HomePage: React.FC = () => {
  const [viewModel, setViewModel] = useState<ListDataFlowViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDataFlows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5071/api/home', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Transform the data to match our expected structure
      const transformedData: ListDataFlowViewModel = {
        dataFlows: data.dataFlows || []
      };
      
      setViewModel(transformedData);
    } catch (err) {
      console.error('Error fetching data flows:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFlows();
  }, []);

  const handlePostCreated = () => {
    setMessage('Post created successfully!');
    fetchDataFlows(); // Refresh the list
    setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
  };

  const handlePostDeleted = () => {
    setMessage('Post deleted successfully!');
    fetchDataFlows(); // Refresh the list
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="card p-8" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: '#2563eb', fontSize: '1.2rem', fontWeight: '500' }}>
          Loading posts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8" style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca'
      }}>
        <div style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: '500' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Message */}
      {message && (
        <div style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '16px 24px', 
          backgroundColor: '#10b981', 
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {/* Main Content Container */}
      <div style={{ padding: '24px 0' }}>
        
        {/* Create Post Section - Compact */}
        <div className="card" style={{ 
          padding: '20px', 
          marginBottom: '24px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ 
              color: '#2563eb', 
              margin: '0',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Share Your Experience
            </h2>
            <CreateFlowForm onPostCreated={handlePostCreated} />
          </div>
        </div>

        {/* Posts Section - Only show if there are posts */}
        {viewModel?.dataFlows && viewModel.dataFlows.length > 0 && (
          <div className="card" style={{ 
            padding: '24px', 
            marginBottom: '24px',
            backgroundColor: '#ffffff'
          }}>
            <h2 style={{ 
              color: '#2563eb', 
              marginBottom: '20px',
              fontSize: '1.25rem',
              fontWeight: '600',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '8px'
            }}>
              Recent Posts ({viewModel.dataFlows.length})
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {viewModel.dataFlows.map(post => (
                <DataFlowPost 
                  key={post.id} 
                  post={post} 
                  onPostDeleted={handlePostDeleted}
                  onCommentAdded={fetchDataFlows}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Posts Message - Only show if no posts exist */}
        {(!viewModel?.dataFlows || viewModel.dataFlows.length === 0) && !loading && (
          <div className="card" style={{ 
            padding: '60px 40px', 
            marginBottom: '24px',
            backgroundColor: '#ffffff',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '3rem',
              marginBottom: '16px'
            }}>
              📝
            </div>
            <h3 style={{ 
              color: '#374151',
              marginBottom: '8px',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              No Posts Yet
            </h3>
            <p style={{ 
              color: '#6b7280',
              margin: '0',
              fontSize: '1rem'
            }}>
              Be the first to share your job experience or opportunity!
            </p>
          </div>
        )}

        {/* CV Analysis Tool */}
        <CvJobAdComparison />
      </div>
    </>
  );
};

export default HomePage;