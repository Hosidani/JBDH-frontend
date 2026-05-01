import React from 'react';
import { PageCard } from '../../components/common/PageCard';
import { useTranslation } from '../../hooks/TranslationProvider';
import { type SelectableItem } from './SelectableListSection';
import JobsAndCvsLayout from './JobsAndCvsLayout';
import MatchTableResult, { type MatchRow } from './MatchTableResult';

function mockScore(cvId: number, jobId: number): number {
  return ((cvId * 7 + jobId * 13) % 97) / 96;
}

const JobsAndCvsTblPage: React.FC = () => {
  const { tSync } = useTranslation();

  return (
    <JobsAndCvsLayout
      renderResult={(activeCvs: SelectableItem[], activeJobs: SelectableItem[]) => {
        const rows: MatchRow[] = activeJobs.flatMap(job =>
          activeCvs.map(cv => ({ job, cv, score: mockScore(cv.id, job.id) }))
        );

        return (
          <PageCard title={tSync('jac_result')}>
            <MatchTableResult
              rows={rows}
              jobLabel={tSync('jac_col_job')}
              cvLabel={tSync('jac_tbl_col_cv')}
              scoreLabel={tSync('jac_tbl_col_score')}
              emptyLabel={tSync('jac_result_empty')}
            />
          </PageCard>
        );
      }}
    />
  );
};

export default JobsAndCvsTblPage;
