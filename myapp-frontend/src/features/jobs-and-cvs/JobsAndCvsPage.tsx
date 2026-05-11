import React, { useState } from 'react';
import { PageCard } from '../../components/common/PageCard';
import { PageBackground } from '../../components/common';
import { NamePill } from '../../components/common/NamePill';
import { useTranslation } from '../../hooks/TranslationProvider';
import { type SelectableItem } from './SelectableListSection';
import { type AtsResultPreview } from './JobsAndCvsLayout';
import JobsAndCvsLayout from './JobsAndCvsLayout';
import AtsResultDetailModal, { type AtsResultDetail } from '../ats/AtsResultDetailModal';
import { ApiService } from '../../services/ApiService';
import { parseJobName } from '../../utils/parseJobName';
import groupExerciseImg from '../../assets/img/groupexercise.png';

const JobsAndCvsPage: React.FC = () => {
  const { tSync } = useTranslation();
  const [detail, setDetail] = useState<AtsResultDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePillClick = async (atsResultId: number) => {
    setModalOpen(true);
    try {
      const d = await ApiService.getAtsResult(atsResultId);
      setDetail(d as AtsResultDetail);
    } catch {
      setModalOpen(false);
    }
  };

  return (
    <>
      <PageBackground imageUrl={groupExerciseImg} opacity={1} blur={0} />
      <JobsAndCvsLayout
        renderResult={(activeCvs: SelectableItem[], activeJobs: SelectableItem[], atsResults: AtsResultPreview[]) => {
          const atsMap = new Map<string, AtsResultPreview>();
          atsResults.forEach(r => {
            if (r.overall_score != null) {
              const jobTitle = parseJobName(r.job_name).title || r.job_name;
              atsMap.set(`${r.cv_name}|||${jobTitle}`, r);
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
                                const match = atsMap.get(`${cv.name}|||${job.name}`);
                                const hasScore = match != null;
                                const position = hasScore ? (match.overall_score! / 100) : 0.5;
                                return (
                                  <div
                                    key={cv.id}
                                    className="absolute"
                                    style={{
                                      left: `calc(${position * 100}% - 17px)`,
                                      opacity: hasScore ? 1 : 0.3,
                                    }}
                                  >
                                    <NamePill
                                      id={cv.id}
                                      title={cv.name}
                                      size="sm"
                                      onClick={hasScore ? () => handlePillClick(match.id) : undefined}
                                    />
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

      <AtsResultDetailModal
        open={modalOpen}
        result={detail}
        onClose={() => { setModalOpen(false); setDetail(null); }}
      />
    </>
  );
};

export default JobsAndCvsPage;
