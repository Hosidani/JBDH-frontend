import React, { useState } from 'react';
import { PageWrapper, PageBackground } from '../../components/common';
import laptopWorkImg from '../../assets/img/Laptop-work.png';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import { Button } from '../../components/ui/Button';
import { useServiceMessages } from '../../hooks/useServiceMessages';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { type ServiceMessage, type MessageCategory } from '../../config/serviceMessages';

const categoryColors: Record<MessageCategory, string> = {
  beta:        'bg-orange-100 text-orange-700 border border-orange-200',
  ai:          'bg-purple-100 text-purple-700 border border-purple-200',
  update:      'bg-blue-100 text-blue-700 border border-blue-200',
  maintenance: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { allMessages, isRead, acknowledge } = useServiceMessages(user?.email);
  const { tSync, language } = useTranslation();
  const [selectedMessage, setSelectedMessage] = useState<ServiceMessage | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    setSelectedMessage(null);
    setDontShowAgain(false);
  };

  const handleConfirm = (msg: ServiceMessage) => {
    if (dontShowAgain) acknowledge(msg.id);
    handleClose();
  };

  return (
    <>
      <PageBackground imageUrl={laptopWorkImg} opacity={1} blur={0} />
      <PageWrapper className="relative z-10">

        {selectedMessage ? (
          <SectionCard className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors mr-1" aria-label="Tillbaka">
                &#8592;
              </button>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${categoryColors[selectedMessage.category]}`}>
                {tSync(`serviceMessages_category_${selectedMessage.category}`)}
              </span>
              <span className="text-xs text-slate-400">{selectedMessage.date}</span>
            </div>
            <div className="py-2">
              <MarkdownRenderer content={language === 'sv' ? selectedMessage.contentSv : selectedMessage.contentEn} />
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={e => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-slate-600">{tSync('serviceMessages_dont_show_again')}</span>
              </label>
              <Button variant="primary" size="lg" className="self-start" onClick={() => handleConfirm(selectedMessage)}>
                {tSync('serviceMessages_acknowledge_button')}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <SectionCard className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">{tSync('serviceMessages_page_title')}</h2>
            {allMessages.length === 0 && (
              <p className="text-slate-500 text-sm">{tSync('serviceMessages_page_empty')}</p>
            )}
            {allMessages.map(msg => {
              const read = isRead(msg.id);
              const title = language === 'sv' ? msg.titleSv : msg.titleEn;
              return (
                <button
                  key={msg.id}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left rounded-lg border transition hover:bg-slate-50 ${read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}
                  onClick={() => { setSelectedMessage(msg); setDontShowAgain(false); }}
                >
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm shrink-0 ${categoryColors[msg.category]}`}>
                    {tSync(`serviceMessages_category_${msg.category}`)}
                  </span>
                  <span className="flex-1 font-semibold text-slate-800 text-sm">{title}</span>
                  <span className="text-xs text-slate-400 shrink-0">{msg.date}</span>
                  {!read && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 shrink-0" title={tSync('serviceMessages_unread_badge')} />
                  )}
                </button>
              );
            })}
          </SectionCard>
        )}

      </PageWrapper>
    </>
  );
};

export default MessagesPage;
