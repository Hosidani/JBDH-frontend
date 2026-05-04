import React from 'react';
import { PageCard } from '../../components/common/PageCard';
import { NamePill } from '../../components/common/NamePill';
import { useTranslation } from '../../hooks/TranslationProvider';
import { type SelectableItem } from './SelectableListSection';
import { type AtsResultPreview } from './JobsAndCvsLayout';
import JobsAndCvsLayout from './JobsAndCvsLayout';

const JobsAndCvsPage: React.FC = () => {
  const { tSync } = useTranslation();

  return (
    <JobsAndCvsLayout
      renderResult={(activeCvs: SelectableItem[], activeJobs: SelectableItem[], atsResults: AtsResultPreview[]) => {
        const atsMap = new Map<string, number>();
        atsResults.forEach(r => {
          if (r.overall_score != null) {
            atsMap.set(`${r.cv_name}|||${r.job_name}`, r.overall_score / 100);
          }
        });

        return (
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
                              const score = atsMap.get(`${cv.name}|||${job.name}`);
                              const hasScore = score != null;
                              return (
                                <div
                                  key={cv.id}
                                  className="absolute"
                                  style={{
                                    left: `calc(${(hasScore ? score : 0.5) * 100}% - 17px)`,
                                    opacity: hasScore ? 1 : 0.3,
                                  }}
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
        );
      }}
    />
  );
};

export default JobsAndCvsPage;
