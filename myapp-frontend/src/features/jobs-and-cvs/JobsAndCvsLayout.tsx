import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import SelectableListSection, { type SelectableItem } from './SelectableListSection';
import AddCvModal from './AddCvModal';
import AddJobModal from './AddJobModal';

interface JobsAndCvsLayoutProps {
  renderResult: (activeCvs: SelectableItem[], activeJobs: SelectableItem[]) => React.ReactNode;
}

const JobsAndCvsLayout: React.FC<JobsAndCvsLayoutProps> = ({ renderResult }) => {
  const { tSync } = useTranslation();
  const [cvs, setCvs] = useState<SelectableItem[]>([]);
  const [jobs, setJobs] = useState<SelectableItem[]>([]);
  const [selectedCvs, setSelectedCvs] = useState<Set<number>>(new Set());
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);

  useEffect(() => {
    ApiService.getExternalCVs().then(data =>
      setCvs(data.map(c => ({ id: c.id, name: c.name || c.text.slice(0, 50) })))
    ).catch(() => {});
    ApiService.getExternalJobAds().then(data =>
      setJobs(data.map(j => ({ id: j.id, name: j.name || j.text.slice(0, 50) })))
    ).catch(() => {});
  }, []);

  const handleDeleteCvs = () => {
    selectedCvs.forEach(id => ApiService.deleteExternalCV(id).catch(() => {}));
    setCvs(prev => prev.filter(c => !selectedCvs.has(c.id)));
    setSelectedCvs(new Set());
  };

  const handleDeleteJobs = () => {
    selectedJobs.forEach(id => ApiService.deleteExternalJobAd(id).catch(() => {}));
    setJobs(prev => prev.filter(j => !selectedJobs.has(j.id)));
    setSelectedJobs(new Set());
  };

  const activeCvs = cvs.filter(c => selectedCvs.has(c.id));
  const activeJobs = jobs.filter(j => selectedJobs.has(j.id));

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <PageCard title={tSync('jac_saved_cvs')} className="flex flex-col">
          <SelectableListSection
            title={tSync('jac_saved_cvs')}
            items={cvs}
            selected={selectedCvs}
            onSelectionChange={setSelectedCvs}
            onAdd={() => setCvModalOpen(true)}
            onDelete={handleDeleteCvs}
            addLabel={tSync('jac_add_cv')}
            deleteLabel={tSync('jac_delete_cv')}
            selectAllLabel={tSync('jac_select_all_cvs')}
            emptyLabel={tSync('jac_empty')}
            showPill
            className="flex-1"
          />
        </PageCard>

        <PageCard title={tSync('jac_saved_jobs')} className="flex flex-col">
          <SelectableListSection
            title={tSync('jac_saved_jobs')}
            items={jobs}
            selected={selectedJobs}
            onSelectionChange={setSelectedJobs}
            onAdd={() => setJobModalOpen(true)}
            onDelete={handleDeleteJobs}
            addLabel={tSync('jac_add_job')}
            deleteLabel={tSync('jac_delete_job')}
            selectAllLabel={tSync('jac_select_all_jobs')}
            emptyLabel={tSync('jac_empty')}
            className="flex-1"
          />
        </PageCard>
      </div>

      {renderResult(activeCvs, activeJobs)}

      <AddCvModal
        open={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        onAdded={item => setCvs(prev => [{ id: item.id, name: item.name || item.text.slice(0, 50) }, ...prev])}
      />
      <AddJobModal
        open={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        onAdded={item => setJobs(prev => [{ id: item.id, name: item.name || item.text.slice(0, 50) }, ...prev])}
      />
    </PageWrapper>
  );
};

export default JobsAndCvsLayout;
