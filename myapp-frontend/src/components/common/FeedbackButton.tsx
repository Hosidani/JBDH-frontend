import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/TranslationProvider';

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { tSync } = useTranslation();
  const location = useLocation();

  const handleSubmit = () => {
    // TODO: POST to feedback endpoint with text, location.pathname, account name/email, timestamp
    setText('');
    setOpen(false);
  };

  const handleCancel = () => {
    setText('');
    setOpen(false);
  };

  return (
    <>
      {/* Bookmark trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label={tSync('feedback_button_label')}
        className="fixed right-0 bottom-32 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg flex items-center justify-center shadow-lg transition-colors duration-150"
        style={{ width: 52, height: 52 }}
      >
        <Icon name="feedback" size={32} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 p-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800">{tSync('feedback_modal_title')}</h2>
            <p className="text-sm text-slate-600">{tSync('feedback_modal_description')}</p>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={5}
              placeholder={tSync('feedback_placeholder')}
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 pt-2">
              <Button variant="primary" size="lg" onClick={handleSubmit}>
                {tSync('feedback_submit_button')}
              </Button>
              <Button variant="secondary" size="lg" onClick={handleCancel}>
                {tSync('button_cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
