import React, { useState } from 'react';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { ApiService } from '../../services/ApiService';

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (item: { id: number; name: string; text: string; created_at: string }) => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ open, onClose, onAdded }) => {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setText('');
    setName('');
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await ApiService.createExternalJobAd(text.trim(), name.trim() || undefined);
      onAdded(created);
      handleClose();
    } catch {
      setError('Kunde inte spara jobbannonsen. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Lägg till jobb">
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Klistra in jobbannonsens text här…"
          rows={8}
          className="border border-slate-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Titel (t.ex. Mjukvaruutvecklare (Saab))"
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleClose}>Avbryt</Button>
          <Button variant="primary" size="sm" disabled={!text.trim()} loading={saving} onClick={handleSave}>
            Spara jobb
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddJobModal;
