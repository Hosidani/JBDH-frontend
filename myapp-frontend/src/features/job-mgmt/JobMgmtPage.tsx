import React, { useEffect, useMemo, useState } from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import { parseJobName } from '../../utils/parseJobName';
import AddJobModal from '../jobs-and-cvs/AddJobModal';
import coffeBreakImg from '../../assets/img/Coffe-break.png';

interface JobItem { id: number; displayName: string; rawName: string; channel?: string; text: string }

const JobMgmtPage: React.FC = () => {
  const { tSync } = useTranslation();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; name: string; text: string } | undefined>(undefined);

  useEffect(() => {
    ApiService.getExternalJobAds().then(data => {
      setJobs(data.map(j => {
        const parsed = parseJobName(j.name || '');
        return { id: j.id, displayName: parsed.title || j.text.slice(0, 50), rawName: j.name || '', channel: parsed.channel || undefined, text: j.text };
      }));
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
    setChecked(prev => prev.size === jobs.length ? new Set() : new Set(jobs.map(j => j.id)));
  };

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await Promise.all([...checked].map(id => ApiService.deleteExternalJobAd(id)));
      setJobs(prev => prev.filter(j => !checked.has(j.id)));
      setChecked(new Set());
    } catch { /* silently ignore */ }
    finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleEdit = (job: JobItem) => {
    setEditItem({ id: job.id, name: job.rawName, text: job.text });
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
    setEditItem(undefined);
  };

  const channelSuggestions = useMemo(
    () => [...new Set(jobs.map(j => j.channel).filter(Boolean) as string[])],
    [jobs],
  );

  const allChecked = jobs.length > 0 && checked.size === jobs.length;
  const someChecked = checked.size > 0;

  return (
    <>
      <PageBackground imageUrl={coffeBreakImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <PageCard
          title={tSync('mgmt_jobs_title')}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditItem(undefined); setAddOpen(true); }}
                title={tSync('jac_add_job')}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Icon name="add" size={22} />
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!someChecked}
                title={tSync('jac_delete_job')}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="delete" size={22} />
              </button>
            </div>
          }
        >
          {jobs.length === 0 ? (
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
              {jobs.map(job => (
                <li
                  key={job.id}
                  className="group flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(job.id)}
                    onChange={() => toggleCheck(job.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{job.displayName}</p>
                    {job.channel && <p className="text-xs text-slate-400 truncate">{job.channel}</p>}
                  </div>
                  <button
                    onClick={() => handleEdit(job)}
                    title={tSync('jac_edit_job_title')}
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
        title={tSync('jac_delete_job_confirm_title')}
      >
        <p className="text-sm text-slate-600 mb-6">{tSync('jac_delete_job_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmOpen(false)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={handleDeleteConfirmed}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>

      <AddJobModal
        open={addOpen}
        onClose={handleAddClose}
        editItem={editItem}
        onAdded={item => {
          const parsed = parseJobName(item.name || '');
          setJobs(prev => [{ id: item.id, displayName: parsed.title || item.text.slice(0, 50), rawName: item.name || '', channel: parsed.channel || undefined, text: item.text }, ...prev]);
          handleAddClose();
        }}
        onUpdated={item => {
          const parsed = parseJobName(item.name || '');
          setJobs(prev => prev.map(j => j.id === item.id ? { ...j, displayName: parsed.title || item.text.slice(0, 50), rawName: item.name || '', text: item.text } : j));
          handleAddClose();
        }}
        channelSuggestions={channelSuggestions}
      />
    </>
  );
};

export default JobMgmtPage;
