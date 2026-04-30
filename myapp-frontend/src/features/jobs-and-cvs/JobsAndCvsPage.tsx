import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { NamePill } from '../../components/common/NamePill';
import { ApiService } from '../../services/ApiService';
import SelectableListSection, { type SelectableItem } from './SelectableListSection';
import AddCvModal from './AddCvModal';
import AddJobModal from './AddJobModal';

function mockScore(cvId: number, jobId: number): number {
  return ((cvId * 7 + jobId * 13) % 97) / 96;
}

const JobsAndCvsPage: React.FC = () => {
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
      {/* CV and Job sections side by side */}
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

      {/* Result section */}
      <PageCard title={tSync('jac_result')}>
        {activeJobs.length === 0 || activeCvs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{tSync('jac_result_empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 font-normal pb-2 pr-4 w-48">{tSync('jac_col_job')}</th>
                  <th className="text-left text-slate-400 font-normal pb-2">
                    <div className="flex justify-between text-xs">
                      <span>{tSync('jac_col_low_match')}</span>
                      <span>{tSync('jac_col_high_match')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map(job => (
                  <tr key={job.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4 text-slate-700 font-medium align-top w-48 truncate max-w-[180px]">
                      {job.name}
                    </td>
                    <td className="py-3 relative" style={{ height: 40 }}>
                      <div className="relative w-full h-full flex items-center">
                        {activeCvs.map(cv => {
                          const score = mockScore(cv.id, job.id);
                          return (
                            <div
                              key={cv.id}
                              className="absolute"
                              style={{ left: `calc(${score * 100}% - 17px)` }}
                            >
                              <NamePill id={cv.id} title={cv.name} size="sm" />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

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

export default JobsAndCvsPage;
