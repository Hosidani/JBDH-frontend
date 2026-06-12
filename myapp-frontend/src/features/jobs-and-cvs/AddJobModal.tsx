import React, { useState } from 'react';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { ComboInput } from '../../components/ui/ComboInput';
import { ApiService } from '../../services/ApiService';
import { LocalDbService } from '../../db/LocalDbService';
import { analyzeJob } from '../../ai/ai';
import { useTranslation } from '../../hooks/TranslationProvider';
import { parseJobName, buildJobName } from '../../utils/parseJobName';

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (item: { id: number; name: string; text: string; created_at: string }) => void;
  onUpdated?: (item: { id: number; name: string; text: string }) => void;
  editItem?: { id: number; name: string; text: string };
  channelSuggestions?: string[];
}

const AddJobModal: React.FC<AddJobModalProps> = ({
  open,
  onClose,
  onAdded,
  onUpdated,
  editItem,
  channelSuggestions = [],
}) => {
  const { tSync } = useTranslation();
  const [text, setText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!editItem;

  React.useEffect(() => {
    if (open) {
      setText(editItem?.text ?? '');
      const parsed = parseJobName(editItem?.name ?? '');
      setJobTitle(parsed.title);
      setChannel(parsed.channel);
      setUrl(parsed.url);
      setError(null);
    }
  }, [open, editItem]);

  const handleClose = () => {
    setText('');
    setJobTitle('');
    setChannel('');
    setUrl('');
    setError(null);
    onClose();
  };

  const triggerAnalysis = (jobId: string, title: string, description: string) => {
    analyzeJob(title, description)
      .then(structured => LocalDbService.updateJob(jobId, { job_json: JSON.stringify(structured) }))
      .catch(() => {});
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    const name = buildJobName(jobTitle.trim(), channel.trim(), url.trim());
    try {
      if (isEdit && editItem) {
        const updated = await ApiService.updateExternalJobAd(editItem.id, text.trim(), name || undefined);
        const existing = await LocalDbService.getJobByBackendId(editItem.id);
        if (existing) {
          await LocalDbService.updateJob(existing.job_id, {
            job_title: jobTitle.trim(),
            job_channel: channel.trim(),
            job_description: text.trim(),
            job_json: '',
            job_url: url.trim(),
            backend_id: editItem.id,
          });
          triggerAnalysis(existing.job_id, jobTitle.trim(), text.trim());
        } else {
          const created = await LocalDbService.addJob({
            backend_id: editItem.id,
            job_title: jobTitle.trim(),
            job_channel: channel.trim(),
            job_description: text.trim(),
            job_json: '',
            job_url: url.trim(),
          });
          triggerAnalysis(created.job_id, jobTitle.trim(), text.trim());
        }
        onUpdated?.({ id: updated.id, name: updated.name, text: updated.text });
      } else {
        const created = await ApiService.createExternalJobAd(text.trim(), name || undefined);
        const idbJob = await LocalDbService.addJob({
          backend_id: created.id,
          job_title: jobTitle.trim(),
          job_channel: channel.trim(),
          job_description: text.trim(),
          job_json: '',
          job_url: url.trim(),
        });
        triggerAnalysis(idbJob.job_id, jobTitle.trim(), text.trim());
        onAdded(created);
      }
      handleClose();
    } catch {
      setError(tSync('jac_add_job_error'));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = isEdit ? tSync('jac_edit_job_title') : tSync('jac_add_job_title');

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle}>
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={tSync('jac_add_job_placeholder')}
          rows={8}
          className="border border-slate-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">{tSync('jac_job_title_label')}</label>
          <input
            type="text"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder={tSync('jac_job_title_placeholder')}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">{tSync('jac_job_channel_label')}</label>
          <ComboInput
            value={channel}
            onChange={setChannel}
            placeholder={tSync('jac_job_channel_placeholder')}
            suggestions={channelSuggestions}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">{tSync('jac_job_url_label')}</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={tSync('jac_job_url_placeholder')}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={handleClose}>{tSync('jac_modal_cancel')}</Button>
          <Button variant="primary" size="lg" disabled={!text.trim()} loading={saving} onClick={handleSave}>
            {isEdit ? tSync('jac_edit_job_save') : tSync('jac_add_job_save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddJobModal;
