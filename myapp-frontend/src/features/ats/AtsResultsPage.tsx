import React, { useEffect, useState, useMemo } from 'react';
import { PageWrapper, PageBackground, Modal } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Button } from '../../components/ui/Button';
import presentationImg from '../../assets/img/Presentation.png';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import AtsResultDetailModal, { type AtsResultDetail } from './AtsResultDetailModal';
import { Icon } from '../../components/ui/Icon';
import { parseJobName } from '../../utils/parseJobName';
import { useLocalAccount, useLocalCandidates } from '../../db/useLocalDb';
import { useAuth } from '../../context/AuthContext';
import { LocalDbService } from '../../db/LocalDbService';
import { AIDisclaimer } from '../../components/common/AIDisclaimer';

interface AtsResultPreview {
  id: number;
  cv_name: string;
  job_name: string;
  overall_score: number | null;
  created_at: string;
}

type SortKey = 'cv_name' | 'job_name' | 'overall_score' | 'created_at';
type SortDir = 'asc' | 'desc';

const SortIcon: React.FC<{ active: boolean; dir: SortDir }> = ({ active, dir }) => (
  <span className={`ml-1 text-xs ${active ? 'text-blue-600' : 'text-slate-300'}`}>
    {active && dir === 'desc' ? '▼' : '▲'}
  </span>
);

const AtsResultsPage: React.FC = () => {
  const { tSync } = useTranslation();
  const [results, setResults] = useState<AtsResultPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [detail, setDetail] = useState<AtsResultDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useAuth();
  const { data: account } = useLocalAccount(user?.email);
  const { data: candidates } = useLocalCandidates(account?.account_id);
  const [cvTitleToCandidate, setCvTitleToCandidate] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!candidates.length) return;
    Promise.all(candidates.map(c => LocalDbService.getCVsForCandidate(c.candidate_id)))
      .then(arrays => {
        const map = new Map<string, string>();
        arrays.forEach((cvList, i) => {
          cvList.forEach(cv => {
            if (cv.cv_title) map.set(cv.cv_title, candidates[i].name);
          });
        });
        setCvTitleToCandidate(map);
      })
      .catch(() => {});
  }, [candidates]);

  const cvLabel = (cvName: string): string => {
    const candidate = cvTitleToCandidate.get(cvName);
    return candidate ? `${candidate}, ${cvName}` : cvName;
  };

  useEffect(() => {
    ApiService.getAtsResults()
      .then(data => setResults(data.filter(r => r.cv_name?.trim() && r.job_name?.trim())))
      .catch(() => setError(tSync('ats_load_error')))
      .finally(() => setLoading(false));
  }, [tSync]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'overall_score' || key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    return [...results].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'cv_name') return cvLabel(a.cv_name).localeCompare(cvLabel(b.cv_name), 'sv') * dir;
      if (sortKey === 'job_name') return (parseJobName(a.job_name).title || a.job_name).localeCompare(parseJobName(b.job_name).title || b.job_name, 'sv') * dir;
      if (sortKey === 'overall_score') return ((a.overall_score ?? -1) - (b.overall_score ?? -1)) * dir;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, sortKey, sortDir, cvTitleToCandidate]);

  const handleRowClick = async (id: number) => {
    setDetailLoading(true);
    setModalOpen(true);
    try {
      const d = await ApiService.getAtsResult(id);
      setDetail(d);
    } catch {
      setModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId == null) return;
    setDeleting(true);
    try {
      await ApiService.deleteAtsResult(confirmDeleteId);
      setResults(prev => prev.filter(r => r.id !== confirmDeleteId));
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const thClass = 'text-left text-slate-500 font-semibold pb-3 pr-4 cursor-pointer select-none hover:text-blue-600 transition-colors text-sm';

  return (
    <>
      <PageBackground imageUrl={presentationImg} opacity={1} blur={0} />
      <PageWrapper className="relative z-10">
      <PageCard title={tSync('ats_page_title')}>
        {loading && (
          <p className="text-sm text-slate-400 text-center py-8">{tSync('ats_loading')}</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center py-8">{error}</p>
        )}
        {!loading && !error && results.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">{tSync('ats_empty')}</p>
        )}
        {!loading && !error && results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={thClass} onClick={() => handleSort('cv_name')}>
                    {tSync('ats_col_cv')}<SortIcon active={sortKey === 'cv_name'} dir={sortDir} />
                  </th>
                  <th className={thClass} onClick={() => handleSort('job_name')}>
                    {tSync('ats_col_job')}<SortIcon active={sortKey === 'job_name'} dir={sortDir} />
                  </th>
                  <th className={`${thClass} text-right`} onClick={() => handleSort('overall_score')}>
                    {tSync('ats_col_score')}<SortIcon active={sortKey === 'overall_score'} dir={sortDir} />
                  </th>
                  <th className={`${thClass} text-right`} onClick={() => handleSort('created_at')}>
                    {tSync('ats_col_date')}<SortIcon active={sortKey === 'created_at'} dir={sortDir} />
                  </th>
                  <th className="pb-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(row => (
                  <tr
                    key={row.id}
                    className="group border-t border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(row.id)}
                  >
                    <td className="py-3 pr-4 text-slate-700 truncate max-w-[200px]">{cvLabel(row.cv_name) || '—'}</td>
                    <td className="py-3 pr-4 text-slate-700 truncate max-w-[200px]">{parseJobName(row.job_name).title || row.job_name || '—'}</td>
                    <td className="py-3 pr-4 text-right font-mono text-slate-600">
                      {row.overall_score != null ? `${Math.round(row.overall_score)}%` : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString('sv-SE')}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(row.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title={tSync('button_delete')}
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {detailLoading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-10 pointer-events-none">
            <div className="bg-white rounded-xl shadow px-6 py-4 text-sm text-slate-500">{tSync('ats_loading')}</div>
          </div>
        )}
        <AIDisclaimer />
      </PageCard>
    </PageWrapper>

      <AtsResultDetailModal
        open={modalOpen}
        result={detail}
        onClose={() => { setModalOpen(false); setDetail(null); }}
      />

      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title={tSync('ats_delete_title')}
      >
        <p className="text-sm text-slate-600 mb-6">{tSync('ats_delete_confirm')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmDeleteId(null)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={handleDeleteConfirm}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AtsResultsPage;
