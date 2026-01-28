import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, PageBackground } from '../../components/common';
import JobDetailCard from '../../components/common/cards/JobDetailCard';
import { ApiService } from '../../services/ApiService';
import type { SavedJob } from '../../components/common/cards';
import type { JobDetailsDto } from '../../services/ApiService';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'matching'>('description');
  const [jobData, setJobData] = useState<JobDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job details from API
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching job details for ID:', id);
        const jobDetails = await ApiService.getJobDetails(parseInt(id));
        console.log('Received job details:', jobDetails);
        setJobData(jobDetails);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Map JobDetailsDto to the expected format
  const job: SavedJob & { competencies?: string[]; matchPercentage?: number; description?: string; matchingAnalysis?: string } = jobData ? {
    id: jobData.jobId,
    title: jobData.title || '---',
    company: jobData.company || '---',
    location: jobData.location || '---',
    workType: jobData.workType || jobData.employmentType || '---',
    lastApplicationDate: jobData.applicationDeadline || '---',
    isActionItem: !jobData.hasApplied,
    saved: jobData.isSaved,
    competencies: jobData.requiredSkills || [],
    matchPercentage: undefined, // This might come from a different API
    description: jobData.description || '---',
    matchingAnalysis: 'CV matching analysis not yet available', // This might come from a different API
  } : {
    id: 0,
    title: 'Job Not Found',
    company: 'Unknown',
    location: 'Unknown',
    workType: 'Unknown',
    lastApplicationDate: '',
    isActionItem: false,
    saved: false,
  };

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log('Apply clicked for job:', job.id);
  };

  const handleSave = async () => {
    if (!jobData) return;
    
    try {
      if (jobData.isSaved) {
        await ApiService.unsaveJob(jobData.jobId);
      } else {
        await ApiService.saveJob(jobData.jobId);
      }
      // Update local state
      setJobData({ ...jobData, isSaved: !jobData.isSaved });
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  const handleNotInterested = async () => {
    if (!jobData) return;
    
    try {
      await ApiService.markNotInterested(jobData.jobId);
      navigate(-1);
    } catch (err) {
      console.error('Error marking job as not interested:', err);
      // Still navigate back even if API call fails
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <>
        <PageBackground imageUrl="/job_detail.png" opacity={1} blur={0} />
        <PageWrapper>
          <div className="card relative z-10 p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Loading job details...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageBackground imageUrl="/job_detail.png" opacity={1} blur={0} />
        <PageWrapper>
          <div className="card relative z-10 p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <PageBackground imageUrl="/job_detail.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="card relative z-10 p-6">
          <JobDetailCard 
            job={job}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onApply={handleApply}
            onSave={handleSave}
            onNotInterested={handleNotInterested}
          />
        </div>
      </PageWrapper>
    </>
  );
};

export default JobDetailPage;
