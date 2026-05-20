import React, { useEffect, useState } from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import AddCvModal from '../jobs-and-cvs/AddCvModal';
import coffeBreakImg from '../../assets/img/Coffe-break.png';

interface CvItem { id: number; name: string; text: string }

const CvMgmtPage: React.FC = () => {
  const { tSync } = useTranslation();
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; name: string } | undefined>(undefined);

  useEffect(() => {
    ApiService.getExternalCVs().then(data => {
      setCvs(data.map(c => ({ id: c.id, name: c.name || c.text.slice(0, 50), text: c.text })));
    }).catch(() => {});
  }, []);

  const toggleCheck = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setChecked(prev => prev.size === cvs.length ? new Set() : new Set(cvs.map(c => c.id)));
  };

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await Promise.all([...checked].map(id => ApiService.deleteExternalCV(id)));
      setCvs(prev => prev.filter(c => !checked.has(c.id)));
      setChecked(new Set());
    } catch { /* silently ignore */ }
    finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleEdit = (cv: CvItem) => {
    setEditItem({ id: cv.id, name: cv.name });
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
    setEditItem(undefined);
  };

  const allChecked = cvs.length > 0 && checked.size === cvs.length;
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
                onClick={() => { setEditItem(undefined); setAddOpen(true); }}
                title={tSync('jac_add_cv')}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Icon name="add" size={22} />
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!someChecked}
                title={tSync('jac_delete_cv')}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="delete" size={22} />
              </button>
            </div>
          }
        >
          {cvs.length === 0 ? (
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
              {cvs.map(cv => (
                <li
                  key={cv.id}
                  className="group flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(cv.id)}
                    onChange={() => toggleCheck(cv.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <span className="flex-1 text-sm text-slate-700 truncate">{cv.name}</span>
                  <button
                    onClick={() => handleEdit(cv)}
                    title={tSync('jac_edit_cv_title')}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </PageWrapper>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={tSync('jac_delete_cv_confirm_title')}
      >
        <p className="text-sm text-slate-600 mb-6">{tSync('jac_delete_cv_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmOpen(false)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={handleDeleteConfirmed}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>

      <AddCvModal
        open={addOpen}
        onClose={handleAddClose}
        editItem={editItem}
        onAdded={item => {
          const name = item.name || item.text.slice(0, 50);
          setCvs(prev => [{ id: item.id, name, text: item.text }, ...prev]);
          handleAddClose();
        }}
        onUpdated={item => {
          setCvs(prev => prev.map(c => c.id === item.id ? { ...c, name: item.name, text: item.text } : c));
          handleAddClose();
        }}
      />
    </>
  );
};

export default CvMgmtPage;
