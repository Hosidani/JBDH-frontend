import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import SelectableListSection, { type SelectableItem } from './SelectableListSection';
import AddCvModal from './AddCvModal';
import AddJobModal from './AddJobModal';

export interface AtsResultPreview {
  id: number;
  cv_name: string;
  job_name: string;
  overall_score: number | null;
  created_at: string;
}

export type RawItem = { id: number; name: string; text: string };

interface JobsAndCvsLayoutProps {
  renderResult: (
    activeCvs: SelectableItem[],
    activeJobs: SelectableItem[],
    atsResults: AtsResultPreview[],
    activeCvsRaw: RawItem[],
    activeJobsRaw: RawItem[],
    refreshAtsResults: () => void,
  ) => React.ReactNode;
  showCvPills?: boolean;
}

const JobsAndCvsLayout: React.FC<JobsAndCvsLayoutProps> = ({ renderResult, showCvPills = true }) => {
  const { tSync } = useTranslation();
  const [cvs, setCvs] = useState<SelectableItem[]>([]);
  const [cvsRaw, setCvsRaw] = useState<RawItem[]>([]);
  const [jobs, setJobs] = useState<SelectableItem[]>([]);
  const [jobsRaw, setJobsRaw] = useState<RawItem[]>([]);
  const [selectedCvs, setSelectedCvs] = useState<Set<number>>(new Set());
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editCv, setEditCv] = useState<{ id: number; name: string } | undefined>(undefined);
  const [editJob, setEditJob] = useState<RawItem | undefined>(undefined);
  const [atsResults, setAtsResults] = useState<AtsResultPreview[]>([]);

  const refreshAtsResults = () => {
    ApiService.getAtsResults().then(setAtsResults).catch(() => {});
  };

  useEffect(() => {
    ApiService.getExternalCVs().then(data => {
      setCvsRaw(data.map(c => ({ id: c.id, name: c.name || c.text.slice(0, 50), text: c.text })));
      setCvs(data.map(c => ({ id: c.id, name: c.name || c.text.slice(0, 50) })));
    }).catch(() => {});
    ApiService.getExternalJobAds().then(data => {
      setJobsRaw(data.map(j => ({ id: j.id, name: j.name || j.text.slice(0, 50), text: j.text })));
      setJobs(data.map(j => ({ id: j.id, name: j.name || j.text.slice(0, 50) })));
    }).catch(() => {});
    refreshAtsResults();
  }, []);

  // Re-fetch ATS results when the user switches back to this browser tab.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAtsResults();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleDeleteCvs = () => {
    selectedCvs.forEach(id => ApiService.deleteExternalCV(id).catch(() => {}));
    setCvs(prev => prev.filter(c => !selectedCvs.has(c.id)));
    setCvsRaw(prev => prev.filter(c => !selectedCvs.has(c.id)));
    setSelectedCvs(new Set());
  };

  const handleEditCv = (id: number) => {
    const raw = cvsRaw.find(c => c.id === id);
    if (raw) {
      setEditCv({ id: raw.id, name: raw.name });
      setCvModalOpen(true);
    }
  };

  const handleCvUpdated = (updated: { id: number; name: string; text: string }) => {
    setCvsRaw(prev => prev.map(c => c.id === updated.id ? updated : c));
    setCvs(prev => prev.map(c => c.id === updated.id ? { id: updated.id, name: updated.name || updated.text.slice(0, 50) } : c));
  };

  const handleDeleteJobs = () => {
    selectedJobs.forEach(id => ApiService.deleteExternalJobAd(id).catch(() => {}));
    setJobs(prev => prev.filter(j => !selectedJobs.has(j.id)));
    setJobsRaw(prev => prev.filter(j => !selectedJobs.has(j.id)));
    setSelectedJobs(new Set());
  };

  const handleEditJob = (id: number) => {
    const raw = jobsRaw.find(j => j.id === id);
    if (raw) {
      setEditJob(raw);
      setJobModalOpen(true);
    }
  };

  const handleJobUpdated = (updated: RawItem) => {
    setJobsRaw(prev => prev.map(j => j.id === updated.id ? updated : j));
    setJobs(prev => prev.map(j => j.id === updated.id ? { id: updated.id, name: updated.name || updated.text.slice(0, 50) } : j));
  };

  const handleCvUpdatedAndRefresh = (updated: RawItem) => { handleCvUpdated(updated); refreshAtsResults(); };
  const handleJobUpdatedAndRefresh = (updated: RawItem) => { handleJobUpdated(updated); refreshAtsResults(); };

  const activeCvs = cvs.filter(c => selectedCvs.has(c.id));
  const activeJobs = jobs.filter(j => selectedJobs.has(j.id));
  const activeCvsRaw = cvsRaw.filter(c => selectedCvs.has(c.id));
  const activeJobsRaw = jobsRaw.filter(j => selectedJobs.has(j.id));

  return (
    <PageWrapper className="relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <PageCard title={tSync('jac_saved_cvs')} className="flex flex-col">
          <SelectableListSection
            title={tSync('jac_saved_cvs')}
            items={cvs}
            selected={selectedCvs}
            onSelectionChange={setSelectedCvs}
            onAdd={() => { setEditCv(undefined); setCvModalOpen(true); }}
            onDelete={handleDeleteCvs}
            addLabel={tSync('jac_add_cv')}
            deleteLabel={tSync('jac_delete_cv')}
            selectAllLabel={tSync('jac_select_all_cvs')}
            emptyLabel={tSync('jac_empty')}
            showPill={showCvPills}
            onEdit={handleEditCv}
            className="flex-1"
          />
        </PageCard>

        <PageCard title={tSync('jac_saved_jobs')} className="flex flex-col">
          <SelectableListSection
            title={tSync('jac_saved_jobs')}
            items={jobs}
            selected={selectedJobs}
            onSelectionChange={setSelectedJobs}
            onAdd={() => { setEditJob(undefined); setJobModalOpen(true); }}
            onDelete={handleDeleteJobs}
            addLabel={tSync('jac_add_job')}
            deleteLabel={tSync('jac_delete_job')}
            selectAllLabel={tSync('jac_select_all_jobs')}
            emptyLabel={tSync('jac_empty')}
            onEdit={handleEditJob}
            className="flex-1"
          />
        </PageCard>
      </div>

      {renderResult(activeCvs, activeJobs, atsResults, activeCvsRaw, activeJobsRaw, refreshAtsResults)}

      <AddCvModal
        open={cvModalOpen}
        onClose={() => { setCvModalOpen(false); setEditCv(undefined); }}
        onAdded={item => {
          const name = item.name || item.text.slice(0, 50);
          setCvsRaw(prev => [{ id: item.id, name, text: item.text }, ...prev]);
          setCvs(prev => [{ id: item.id, name }, ...prev]);
          refreshAtsResults();
        }}
        onUpdated={handleCvUpdatedAndRefresh}
        editItem={editCv}
      />
      <AddJobModal
        open={jobModalOpen}
        onClose={() => { setJobModalOpen(false); setEditJob(undefined); }}
        onAdded={item => {
          const name = item.name || item.text.slice(0, 50);
          setJobsRaw(prev => [{ id: item.id, name, text: item.text }, ...prev]);
          setJobs(prev => [{ id: item.id, name }, ...prev]);
          refreshAtsResults();
        }}
        onUpdated={handleJobUpdatedAndRefresh}
        editItem={editJob}
      />
    </PageWrapper>
  );
};

export default JobsAndCvsLayout;
