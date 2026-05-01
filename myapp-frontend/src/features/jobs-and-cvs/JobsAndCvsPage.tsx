import React from 'react';
import { PageCard } from '../../components/common/PageCard';
import { NamePill } from '../../components/common/NamePill';
import { useTranslation } from '../../hooks/TranslationProvider';
import { type SelectableItem } from './SelectableListSection';
import JobsAndCvsLayout from './JobsAndCvsLayout';

function mockScore(cvId: number, jobId: number): number {
  return ((cvId * 7 + jobId * 13) % 97) / 96;
}

const JobsAndCvsPage: React.FC = () => {
  const { tSync } = useTranslation();

  return (
    <JobsAndCvsLayout
      renderResult={(activeCvs: SelectableItem[], activeJobs: SelectableItem[]) => (
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
      )}
    />
  );
};

export default JobsAndCvsPage;
