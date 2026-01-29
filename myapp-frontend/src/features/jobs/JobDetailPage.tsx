import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, PageBackground } from '../../components/common';
import JobDetailCard from '../../components/common/cards/JobDetailCard';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import type { SavedJob } from '../../components/common/cards';
import type { JobDetailsDto } from '../../services/ApiService';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  const [activeTab, setActiveTab] = useState<'description' | 'matching'>('description');
  const [jobData, setJobData] = useState<JobDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notInterestedLoading, setNotInterestedLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if ((window as any).notInterestedTimer) {
        clearInterval((window as any).notInterestedTimer);
      }
    };
  }, []);

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
    if (jobData?.webpageUrl) {
      // Öppna jobgets web URL i en ny flik
      window.open(jobData.webpageUrl, '_blank');
    } else {
      console.log('No webpage URL available for job:', job.id);
      alert(tSync('jobDetail_no_url_available'));
    }
  };

  const handleSave = async () => {
    if (!jobData || saveLoading) return;
    
    setSaveLoading(true);
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
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNotInterested = async () => {
    if (!jobData) return;
    
    // If already loading, cancel the action
    if (notInterestedLoading) {
      setNotInterestedLoading(false);
      setCountdown(0);
      // Clear the timer
      if ((window as any).notInterestedTimer) {
        clearInterval((window as any).notInterestedTimer);
        (window as any).notInterestedTimer = null;
      }
      return;
    }
    
    setNotInterestedLoading(true);
    setCountdown(5);
    
    // Start countdown timer - API call happens ONLY when countdown reaches 0
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // NOW call the API and navigate to search page
          ApiService.markNotInterested(jobData.jobId)
            .then(() => {
              navigate('/search');
            })
            .catch((err) => {
              console.error('Error marking job as not interested:', err);
              navigate('/search');
            });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Store timer reference to clear it if cancelled
    (window as any).notInterestedTimer = timer;
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
            isLoading={saveLoading}
            isNotInterestedLoading={notInterestedLoading}
            countdown={countdown}
          />
        </div>
      </PageWrapper>
    </>
  );
};

export default JobDetailPage;
