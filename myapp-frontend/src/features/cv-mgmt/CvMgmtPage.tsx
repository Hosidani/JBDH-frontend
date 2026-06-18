import React, { useEffect, useState } from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useLocalAccount, useLocalCandidates } from '../../db/useLocalDb';
import { useAuth } from '../../context/AuthContext';
import { LocalDbService } from '../../db/LocalDbService';
import { ApiService } from '../../services/ApiService';
import type { CV } from '../../db/types';
import AddCvForCandidateModal from '../candidate/AddCvForCandidateModal';
import coffeBreakImg from '../../assets/img/Coffe-break.png';

const CvMgmtPage: React.FC = () => {
  const { tSync } = useTranslation();
  const { user } = useAuth();
  const { data: account } = useLocalAccount(user?.email);
  const { data: candidates } = useLocalCandidates(account?.account_id);

  const [allCvs, setAllCvs] = useState<CV[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!candidates.length) { setAllCvs([]); return; }
    Promise.all(candidates.map(c => LocalDbService.getCVsForCandidate(c.candidate_id)))
      .then(results => setAllCvs(results.flat()))
      .catch(() => {});
  }, [candidates, refreshKey]);

  const candidateMap = Object.fromEntries(candidates.map(c => [c.candidate_id, c.name]));

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCv, setEditCv] = useState<CV | undefined>(undefined);

  const toggleCheck = (id: string) =>
    setChecked(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleAll = () =>
    setChecked(prev => prev.size === allCvs.length ? new Set() : new Set(allCvs.map(c => c.cv_id)));

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      const cvRecords = await Promise.all([...checked].map(id => LocalDbService.getCV(id)));
      await Promise.allSettled(
        cvRecords
          .filter((cv): cv is NonNullable<typeof cv> => !!cv?.backend_id)
          .map(cv => ApiService.deleteExternalCV(cv.backend_id!))
      );
      await Promise.all([...checked].map(id => LocalDbService.deleteCV(id)));
      setChecked(new Set());
      setRefreshKey(k => k + 1);
    } catch { /* silently ignore */ }
    finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openAdd = () => {
    setEditCv(undefined);
    setModalOpen(true);
  };

  const openEdit = (cv: CV) => {
    setEditCv(cv);
    setModalOpen(true);
  };

  const handleModalClose = () => { setModalOpen(false); setEditCv(undefined); };

  const mimeToFormat = (mime: string): string => {
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('wordprocessingml') || mime.includes('docx')) return 'DOCX';
    if (mime.includes('rtf')) return 'RTF';
    if (mime.includes('markdown')) return 'MD';
    if (mime.includes('plain')) return 'TXT';
    return mime;
  };

  const allChecked = allCvs.length > 0 && checked.size === allCvs.length;
  const someChecked = checked.size > 0;

  return (
    <>
      <PageBackground imageUrl={coffeBreakImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <PageCard
          title={tSync('menu_manage_candidate_cvs')}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={openAdd}
                disabled={candidates.length === 0}
                title={tSync('candidate_cv_add_title')}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="add" size={22} />
              </button>
              <button
                onClick={() => someChecked && setConfirmOpen(true)}
                disabled={!someChecked}
                title={tSync('candidate_cv_delete_confirm_title')}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="delete" size={22} />
              </button>
            </div>
          }
        >
          {allCvs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">{tSync('jac_empty')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              <li className="flex items-center gap-3 py-2 px-1">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400 select-none">{tSync('jac_select_all')}</span>
              </li>
              {allCvs.map(cv => (
                <li
                  key={cv.cv_id}
                  onClick={() => openEdit(cv)}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-md cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(cv.cv_id)}
                    onChange={() => toggleCheck(cv.cv_id)}
                    onClick={e => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-700 truncate">
                        {cv.cv_title || 'CV'}
                      </span>
                      {cv.cv_published ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                          {tSync('cv_status_published')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-white text-slate-500 border border-slate-300 whitespace-nowrap">
                          {tSync('cv_status_unpublished')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {candidateMap[cv.candidate_id] && (
                        <span className="text-xs text-slate-500">{candidateMap[cv.candidate_id]}</span>
                      )}
                      {cv.cv_file_type && (
                        <span className="text-xs text-slate-400">{mimeToFormat(cv.cv_file_type)}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </PageWrapper>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={tSync('candidate_cv_delete_confirm_title')}>
        <p className="text-sm text-slate-600 mb-6">{tSync('candidate_cv_delete_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmOpen(false)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={handleDeleteConfirmed}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>

      <AddCvForCandidateModal
        open={modalOpen}
        onClose={handleModalClose}
        defaultCandidateId={editCv?.candidate_id ?? candidates[0]?.candidate_id ?? ''}
        candidates={candidates}
        editCv={editCv}
        onSaved={() => { setRefreshKey(k => k + 1); handleModalClose(); }}
      />
    </>
  );
};

export default CvMgmtPage;
