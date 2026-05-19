import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Modal } from './Modal';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/ApiService';

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [visible, setVisible] = useState(false);
  const { tSync } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname, user]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      let accountEmail = user?.email ?? '';
      let accountName = user?.name ?? '';
      try {
        const settings = await ApiService.getAccountSettings();
        accountEmail = settings.accountEmail ?? settings.account_email ?? accountEmail;
        accountName = settings.accountName ?? settings.account_name ?? accountName;
      } catch { /* ignore — use login data as fallback */ }
      await ApiService.submitFeedback({
        text: text.trim(),
        url: location.pathname,
        accountName,
        accountEmail,
        timestamp: new Date().toISOString(),
      });
      setShowThanks(true);
    } catch { /* silently ignore — close modal regardless */ }
    finally {
      setSubmitting(false);
      setText('');
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setText('');
    setOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Feedback trigger */}
      <div
        className="fixed z-40"
        style={{
          right: 0,
          top: '62%',
          transform: visible ? 'translateX(0)' : 'translateX(80px)',
          transition: visible ? 'transform 0.5s ease-out' : 'none',
        }}
      >
        <button
          onClick={() => setOpen(true)}
          aria-label={tSync('feedback_button_label')}
          title={tSync('feedback_button_label')}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 px-3 shadow-lg transition-colors duration-150 -rotate-90 origin-bottom-right"
          style={{ height: 52, borderRadius: '8px 8px 0 0' }}
        >
          <Icon name="feedback" size={32} />
          <span className="text-m font-medium">Feedback</span>
        </button>
      </div>

      {/* Thanks modal */}
      <Modal open={showThanks} onClose={() => setShowThanks(false)} title={tSync('feedback_thanks_title')}>
        <p className="text-sm text-slate-600 mb-6">{tSync('feedback_thanks_message')}</p>
        <Button variant="primary" size="lg" onClick={() => setShowThanks(false)}>
          {tSync('feedback_thanks_ok')}
        </Button>
      </Modal>

      {/* Feedback modal */}
      <Modal open={open} onClose={handleCancel} title={tSync('feedback_modal_title')}>
        <p className="text-sm text-slate-600 mb-4">{tSync('feedback_modal_description')}</p>
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={5}
          placeholder={tSync('feedback_placeholder')}
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 pt-4">
          <Button variant="primary" size="lg" loading={submitting} disabled={text.trim().length < 10} onClick={handleSubmit}>
            {tSync('feedback_submit_button')}
          </Button>
          <Button variant="secondary" size="lg" disabled={submitting} onClick={handleCancel}>
            {tSync('button_cancel')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default FeedbackButton;
