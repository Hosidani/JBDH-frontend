import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackground, PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useLocalAccount, useLocalCandidates } from '../../db/useLocalDb';
import { LocalDbService } from '../../db/LocalDbService';
import coffeBreakImg from '../../assets/img/Coffe-break.png';

const CandidateMgmtPage: React.FC = () => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { data: account } = useLocalAccount();
  const { data: candidates, refresh } = useLocalCandidates(account?.account_id);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null); // single-row delete
  const [confirmBulk, setConfirmBulk] = useState(false);           // bulk delete
  const [deleting, setDeleting] = useState(false);

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setChecked(prev =>
      prev.size === candidates.length
        ? new Set()
        : new Set(candidates.map(c => c.candidate_id))
    );
  };

  const doDelete = async (ids: string[]) => {
    setDeleting(true);
    try {
      await Promise.all(ids.map(id => LocalDbService.deleteCandidate(id)));
      setChecked(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
      await refresh();
    } catch { /* silently ignore */ }
    finally {
      setDeleting(false);
      setConfirmId(null);
      setConfirmBulk(false);
    }
  };

  const allChecked = candidates.length > 0 && checked.size === candidates.length;
  const someChecked = checked.size > 0;

  return (
    <>
      <PageBackground imageUrl={coffeBreakImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <PageCard
          title={tSync('menu_manage_candidates')}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/candidate')}
                title={tSync('candidate_form_add_title')}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Icon name="add" size={22} />
              </button>
              <button
                onClick={() => someChecked && setConfirmBulk(true)}
                disabled={!someChecked}
                title={tSync('candidate_mgmt_delete_confirm_title')}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="delete" size={22} />
              </button>
            </div>
          }
        >
          {candidates.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">{tSync('candidate_mgmt_empty')}</p>
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
              {candidates.map(c => (
                <li
                  key={c.candidate_id}
                  className="group flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(c.candidate_id)}
                    onChange={() => toggleCheck(c.candidate_id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-slate-700 truncate">{c.name}</span>
                    {c.title && (
                      <span className="block text-xs text-slate-400 truncate">{c.title}</span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/candidate/${c.candidate_id}`)}
                    title={tSync('candidate_form_edit_title')}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    onClick={() => setConfirmId(c.candidate_id)}
                    title={tSync('candidate_mgmt_delete_confirm_title')}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </PageWrapper>

      {/* Single-row delete confirm */}
      <Modal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title={tSync('candidate_mgmt_delete_confirm_title')}
      >
        <p className="text-sm text-slate-600 mb-6">{tSync('candidate_mgmt_delete_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmId(null)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={() => doDelete([confirmId!])}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>

      {/* Bulk delete confirm */}
      <Modal
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        title={tSync('candidate_mgmt_delete_confirm_title')}
      >
        <p className="text-sm text-slate-600 mb-6">{tSync('candidate_mgmt_delete_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmBulk(false)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={() => doDelete([...checked])}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CandidateMgmtPage;
