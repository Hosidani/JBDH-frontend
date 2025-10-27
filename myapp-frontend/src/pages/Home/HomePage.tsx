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
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Posts</h2>
      
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <CreateFlowForm onPostCreated={handlePostCreated} />
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {viewModel?.dataFlows && viewModel.dataFlows.length > 0 ? (
        viewModel.dataFlows.map(post => (
          <DataFlowPost 
            key={post.id} 
            post={post} 
            onPostDeleted={handlePostDeleted}
            onCommentAdded={fetchDataFlows}
          />
        ))
      ) : (
        <div>No posts available. Be the first to create one!</div>
      )}

      <CvJobAdComparison />
    </div>
  );
};

export default HomePage;