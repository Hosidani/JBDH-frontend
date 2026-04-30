import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { NamePill } from '../../components/common/NamePill';
import { ApiService } from '../../services/ApiService';
import SelectableListSection, { type SelectableItem } from './SelectableListSection';
import AddCvModal from './AddCvModal';
import AddJobModal from './AddJobModal';

function mockScore(cvId: number, jobId: number): number {
  return ((cvId * 7 + jobId * 13) % 97) / 96;
}

const JobsAndCvsPage: React.FC = () => {
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
        <SectionCard>
          <SelectableListSection
            title="Sparade CV"
            items={cvs}
            selected={selectedCvs}
            onSelectionChange={setSelectedCvs}
            onAdd={() => setCvModalOpen(true)}
            onDelete={handleDeleteCvs}
            addLabel="Lägg till CV"
            deleteLabel="Ta bort CV"
            showPill
          />
        </SectionCard>

        <SectionCard>
          <SelectableListSection
            title="Sparade Jobb"
            items={jobs}
            selected={selectedJobs}
            onSelectionChange={setSelectedJobs}
            onAdd={() => setJobModalOpen(true)}
            onDelete={handleDeleteJobs}
            addLabel="Lägg till jobb"
            deleteLabel="Ta bort jobb"
          />
        </SectionCard>
      </div>

      {/* Result section */}
      <SectionCard>
        <h2 className="font-bold text-base text-slate-800 mb-4">Resultat CV vs Jobb</h2>
        {activeJobs.length === 0 || activeCvs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Välj minst ett CV och ett jobb för att se resultat.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 font-normal pb-2 pr-4 w-48">Jobb</th>
                  <th className="text-left text-slate-400 font-normal pb-2">
                    <div className="flex justify-between text-xs">
                      <span>Låg Match</span>
                      <span>Hög Match</span>
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
      </SectionCard>

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
