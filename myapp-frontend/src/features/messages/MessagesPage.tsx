import React, { useState } from 'react';
import { PageWrapper, PageBackground } from '../../components/common';
import laptopWorkImg from '../../assets/img/Laptop-work.png';
import { SectionCard } from '../../components/common/SectionCard';
import ServiceMessageModal from '../../components/common/ServiceMessageModal';
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

  return (
    <>
      <PageBackground imageUrl={laptopWorkImg} opacity={1} blur={0} />
    <PageWrapper className="relative z-10">
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
              onClick={() => setSelectedMessage(msg)}
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${categoryColors[msg.category]}`}>
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

      {selectedMessage && (
        <ServiceMessageModal
          message={selectedMessage}
          onAcknowledge={(id) => { acknowledge(id); setSelectedMessage(null); }}
          onDismiss={() => setSelectedMessage(null)}
        />
      )}
    </PageWrapper>
    </>
  );
};

export default MessagesPage;
