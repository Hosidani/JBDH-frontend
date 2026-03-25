import React from 'react';

interface ButtonsCardProps {
  tSync: (key: string) => string;
  onMatchNowClick?: () => void;
  onManualSearchClick?: () => void;
}

const ButtonsCard: React.FC<ButtonsCardProps> = ({ tSync, onMatchNowClick, onManualSearchClick }) => (
  <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
    <button onClick={onMatchNowClick} className="bg-blue-600 text-white px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-700 transition">{tSync('profilePage_match_now_button')}</button>
    <button onClick={onManualSearchClick} className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-50 transition">{tSync('profilePage_manual_search_button')}</button>
    <a href="/saved-jobs" className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-50 transition flex items-center justify-center">{tSync('menu_saved_jobs')}</a>
  </div>
);

export default ButtonsCard;
