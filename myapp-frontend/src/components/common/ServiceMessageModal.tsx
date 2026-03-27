import React, { useState } from 'react';
import { type ServiceMessage, type MessageCategory } from '../../config/serviceMessages';
import MarkdownRenderer from './MarkdownRenderer';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/TranslationProvider';

interface ServiceMessageModalProps {
  message: ServiceMessage;
  onAcknowledge: (id: string) => void;
  onDismiss: () => void;
}

const categoryColors: Record<MessageCategory, string> = {
  beta:        'bg-orange-100 text-orange-700 border border-orange-200',
  ai:          'bg-purple-100 text-purple-700 border border-purple-200',
  update:      'bg-blue-100 text-blue-700 border border-blue-200',
  maintenance: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const ServiceMessageModal: React.FC<ServiceMessageModalProps> = ({ message, onAcknowledge, onDismiss }) => {
  const { tSync, language } = useTranslation();
  const content = language === 'sv' ? message.contentSv : message.contentEn;
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      onAcknowledge(message.id);
    } else {
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-4 border-b border-slate-100">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[message.category]}`}>
            {tSync(`serviceMessages_category_${message.category}`)}
          </span>
          <span className="text-xs text-slate-400">{message.date}</span>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto px-8 py-4 flex-1">
          <MarkdownRenderer content={content} />
        </div>
        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-slate-600">{tSync('serviceMessages_dont_show_again')}</span>
          </label>
          <Button variant="primary" size="lg" onClick={handleConfirm}>
            {tSync('serviceMessages_acknowledge_button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceMessageModal;
