import React, { useEffect, useMemo, useState } from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ApiService } from '../../services/ApiService';
import { LocalDbService } from '../../db/LocalDbService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { parseJobName, buildJobName } from '../../utils/parseJobName';
import type { StructuredJob } from '../../ai/ai';
import AddJobModal from '../jobs-and-cvs/AddJobModal';
import coffeBreakImg from '../../assets/img/Coffe-break.png';

interface JobItem {
  id: number | string;  // BE numeric ID (>0), local-only negative number, or IDB UUID string
  idbId?: string;       // IDB job_id UUID
  displayName: string;
  rawName: string;
  channel?: string;
  text: string;
  idbTitle?: string;
  company?: string;
  applyLatest?: string;
  domain?: string;
}

const JobMgmtPage: React.FC = () => {
  const { tSync } = useTranslation();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [checked, setChecked] = useState<Set<number | string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; idbId?: string; name: string; text: string } | undefined>(undefined);

  useEffect(() => {
    const parseIdbJob = (j: { job_id: string; backend_id?: number; job_title: string; job_channel: string; job_description: string; job_json: string; job_url: string }): JobItem => {
      let structured: StructuredJob | null = null;
      if (j.job_json) { try { structured = JSON.parse(j.job_json) as StructuredJob; } catch { /* skip */ } }
      return {
        id: j.backend_id ?? j.job_id,
        idbId: j.job_id,
        displayName: j.job_title || j.job_description.slice(0, 50),
        rawName: buildJobName(j.job_title, j.job_channel, j.job_url),
        channel: j.job_channel || undefined,
        text: j.job_description,
        idbTitle: structured?.title ?? j.job_title ?? undefined,
        company: structured?.job_company ?? undefined,
        applyLatest: structured?.job_apply_latest ?? undefined,
        domain: structured?.domain ?? undefined,
      };
    };

    if (user) {
      Promise.all([
        ApiService.getExternalJobAds(),
        LocalDbService.getAllJobs(),
      ]).then(([backendJobs, idbJobs]) => {
        const idbByBackendId = new Map(idbJobs.map(j => [j.backend_id, j]));
        const beJobIds = new Set(backendJobs.map(j => j.id));

        const beMapped: JobItem[] = backendJobs.map(j => {
          const parsed = parseJobName(j.name || '');
          const idb = idbByBackendId.get(j.id);
          let structured: StructuredJob | null = null;
          if (idb?.job_json) { try { structured = JSON.parse(idb.job_json) as StructuredJob; } catch { /* skip */ } }
          return {
            id: j.id,
            idbId: idb?.job_id,
            displayName: parsed.title || j.text.slice(0, 50),
            rawName: j.name || '',
            channel: parsed.channel || undefined,
            text: j.text,
            idbTitle: structured?.title ?? idb?.job_title ?? undefined,
            company: structured?.job_company ?? undefined,
            applyLatest: structured?.job_apply_latest ?? undefined,
            domain: structured?.domain ?? undefined,
          };
        });

        const localOnly = idbJobs
          .filter(j => !j.backend_id || !beJobIds.has(j.backend_id))
          .map(parseIdbJob);

        setJobs([...beMapped, ...localOnly]);
      }).catch(() => {});
    } else {
      LocalDbService.getAllJobs()
        .then(idbJobs => setJobs(idbJobs.map(parseIdbJob)))
        .catch(() => {});
    }
  }, [user]);

  const toggleCheck = (id: number | string) => {
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
      const toDelete = jobs.filter(j => checked.has(j.id));
      await Promise.all([
        // Delete from BE only for jobs with a numeric backend ID and when logged in
        ...(user ? toDelete.filter(j => typeof j.id === 'number' && j.id > 0).map(j => ApiService.deleteExternalJobAd(j.id as number).catch(() => {})) : []),
        // Delete from IDB for all jobs that have an IDB UUID
        ...toDelete.filter(j => j.idbId).map(j => LocalDbService.deleteJob(j.idbId!).catch(() => {})),
      ]);
      setJobs(prev => prev.filter(j => !checked.has(j.id)));
      setChecked(new Set());
    } catch { /* silently ignore */ }
    finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleEdit = (job: JobItem) => {
    setEditItem({
      id: typeof job.id === 'number' ? job.id : 0,
      idbId: job.idbId,
      name: job.rawName,
      text: job.text,
    });
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
                  onClick={() => handleEdit(job)}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-md cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(job.id)}
                    onChange={() => toggleCheck(job.id)}
                    onClick={e => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {[
                        job.idbTitle || job.displayName,
                        job.company,
                        job.applyLatest ? new Date(job.applyLatest).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                      ].filter(Boolean).join(', ')}
                    </p>
                    {(job.domain || job.channel) && (
                      <p className="text-xs text-slate-400 truncate">
                        {[job.domain, job.channel].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
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
          setJobs(prev => [{
            id: item.id,
            idbId: item.idbId,
            displayName: parsed.title || item.text.slice(0, 50),
            rawName: item.name || '',
            channel: parsed.channel || undefined,
            text: item.text,
          }, ...prev]);
          handleAddClose();
        }}
        onUpdated={item => {
          const parsed = parseJobName(item.name || '');
          setJobs(prev => prev.map(j =>
            (editItem && j.idbId && j.idbId === editItem.idbId) || j.id === item.id
              ? { ...j, displayName: parsed.title || item.text.slice(0, 50), rawName: item.name || '', text: item.text }
              : j
          ));
          handleAddClose();
        }}
        channelSuggestions={channelSuggestions}
      />
    </>
  );
};

export default JobMgmtPage;
