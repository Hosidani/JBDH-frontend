import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { SavedJobsList } from '../../components/common/cards';
import { ApiService } from '../../services/ApiService';
import type { SavedJob } from '../../components/common/cards';
import type { JobDetailsDto } from '../../services/ApiService';

const SavedJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesModal, setNotesModal] = useState<{ isOpen: boolean; jobId: number; notes: string }>({ isOpen: false, jobId: 0, notes: '' });

  // Function to map JobDetailsDto to SavedJob
  const mapJobDetailsToSavedJob = (jobDetails: JobDetailsDto): SavedJob => ({
    id: jobDetails.jobId,
    title: jobDetails.title || '---',
    company: jobDetails.company || '---',
    location: jobDetails.location || '---',
    workType: jobDetails.workType || jobDetails.employmentType || '---',
    lastApplicationDate: jobDetails.applicationDeadline || '---',
    isActionItem: !jobDetails.hasApplied, // Action item if not applied yet
    saved: jobDetails.isSaved,
    notes: jobDetails.notes || undefined,
  });

  // Fetch saved jobs from API
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching saved jobs from API...');
        const savedJobsData = await ApiService.getSavedJobs();
        console.log('Received saved jobs data from API:', savedJobsData);
        const mappedJobs = savedJobsData.map(mapJobDetailsToSavedJob);
        console.log('Mapped jobs:', mappedJobs);
        setJobs(mappedJobs);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setError(tSync('savedJobsPage_error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [tSync]);

  const handleSave = async (id: number) => {
    try {
      const job = jobs.find(j => j.id === id);
      if (!job) return;

      if (job.saved) {
        await ApiService.unsaveJob(id);
      } else {
        await ApiService.saveJob(id);
      }

      // Update local state
      setJobs(jobs.map(j => 
        j.id === id ? { ...j, saved: !j.saved } : j
      ));
    } catch (err) {
      console.error('Error toggling save status:', err);
      // You could show a toast notification here
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ApiService.unsaveJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error('Error removing saved job:', err);
      // You could show a toast notification here
    }
  };

  const handleNotes = async (id: number) => {
    const job = jobs.find(j => j.id === id);
    const currentNotes = job?.notes || '';
    setNotesModal({ isOpen: true, jobId: id, notes: currentNotes });
  };

  const handleSaveNotes = async () => {
    try {
      console.log(`Updating notes for job ${notesModal.jobId}:`, notesModal.notes);
      await ApiService.updateJobNotes(notesModal.jobId, notesModal.notes);
      
      // Update local state after successful API call
      setJobs(jobs.map(j => 
        j.id === notesModal.jobId ? { ...j, notes: notesModal.notes || undefined } : j
      ));
      
      console.log('Notes updated successfully');
      setNotesModal({ isOpen: false, jobId: 0, notes: '' });
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes. Please try again.');
    }
  };

  const handleCancelNotes = () => {
    setNotesModal({ isOpen: false, jobId: 0, notes: '' });
  };

  const handleCardClick = (id: number) => {
    navigate(`/job/${id}`);
  };

  return (
    <>
      <PageBackground imageUrl="/saved_jobs.png" opacity={1} blur={0} />
      <PageWrapper>
        <SectionCard className="relative z-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2563eb' }}>
            {tSync('savedJobsPage_title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {tSync('savedJobsPage_description')}
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <SavedJobsList
            jobs={jobs}
            onSave={handleSave}
            onDelete={handleDelete}
            onClick={handleCardClick}
            onNotes={handleNotes}
            loading={loading}
          />

          {/* Notes Modal */}
          {notesModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  {tSync('savedJobsPage_edit_notes')}
                </h3>
                <textarea
                  value={notesModal.notes}
                  onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value })}
                  placeholder={tSync('savedJobsPage_notes_placeholder')}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    onClick={handleCancelNotes}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {tSync('savedJobsPage_cancel')}
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {tSync('savedJobsPage_save')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </PageWrapper>
    </>
  );
};

export default SavedJobsPage;
