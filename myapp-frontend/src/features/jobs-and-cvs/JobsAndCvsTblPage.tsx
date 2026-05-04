import React, { useState } from 'react';
import { PageCard } from '../../components/common/PageCard';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../hooks/TranslationProvider';
import { type SelectableItem } from './SelectableListSection';
import { type AtsResultPreview, type RawItem } from './JobsAndCvsLayout';
import JobsAndCvsLayout from './JobsAndCvsLayout';
import MatchTableResult, { type MatchRow } from './MatchTableResult';
import AtsResultDetailModal, { type AtsResultDetail } from '../ats/AtsResultDetailModal';
import { ApiService } from '../../services/ApiService';

const JobsAndCvsTblPage: React.FC = () => {
  const { tSync } = useTranslation();
  const [detail, setDetail] = useState<AtsResultDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleRowClick = async (atsResultId: number) => {
    setModalOpen(true);
    try {
      const d = await ApiService.getAtsResult(atsResultId);
      setDetail(d as AtsResultDetail);
    } catch {
      setModalOpen(false);
    }
  };

  const handleRunAnalysis = async (
    missingPairs: { cv: RawItem; job: RawItem }[],
    refreshAtsResults: () => void,
  ) => {
    if (missingPairs.length === 0 || analyzing) return;
    setAnalyzing(true);
    setProgress({ done: 0, total: missingPairs.length });
    for (const { cv, job } of missingPairs) {
      try {
        await ApiService.runAtsScore(cv.text, job.text);
      } catch {
        // continue with remaining pairs even if one fails
      }
      setProgress(p => p ? { ...p, done: p.done + 1 } : null);
    }
    refreshAtsResults();
    setAnalyzing(false);
    setProgress(null);
  };

  return (
    <>
      <JobsAndCvsLayout
        renderResult={(
          activeCvs: SelectableItem[],
          activeJobs: SelectableItem[],
          atsResults: AtsResultPreview[],
          activeCvsRaw: RawItem[],
          activeJobsRaw: RawItem[],
          refreshAtsResults: () => void,
        ) => {
          const atsMap = new Map<string, AtsResultPreview>();
          atsResults.forEach(r => atsMap.set(`${r.cv_name}|||${r.job_name}`, r));

          const rows: MatchRow[] = activeJobs.flatMap(job =>
            activeCvs.map(cv => {
              const match = atsMap.get(`${cv.name}|||${job.name}`);
              return { job, cv, score: match?.overall_score ?? null, atsResultId: match?.id };
            })
          );

          const missingPairs = activeJobs.flatMap(job =>
            activeCvs
              .filter(cv => !atsMap.has(`${cv.name}|||${job.name}`))
              .map(cv => ({
                cv: activeCvsRaw.find(r => r.id === cv.id)!,
                job: activeJobsRaw.find(r => r.id === job.id)!,
              }))
              .filter(p => p.cv && p.job)
          );

          const hasSelection = activeCvs.length > 0 && activeJobs.length > 0;

          return (
            <PageCard title={tSync('jac_result')}>
              {hasSelection && missingPairs.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">
                    {analyzing && progress
                      ? `${tSync('ats_analyzing')} ${progress.done}/${progress.total}…`
                      : `${missingPairs.length} ${tSync('ats_pairs_missing')}`}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={analyzing}
                    onClick={() => handleRunAnalysis(missingPairs, refreshAtsResults)}
                  >
                    {tSync('ats_run_analysis')}
                  </Button>
                </div>
              )}
              <MatchTableResult
                rows={rows}
                jobLabel={tSync('jac_col_job')}
                cvLabel={tSync('jac_tbl_col_cv')}
                scoreLabel={tSync('jac_tbl_col_score')}
                emptyLabel={tSync('jac_result_empty')}
                onRowClick={handleRowClick}
              />
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

export default JobsAndCvsTblPage;
