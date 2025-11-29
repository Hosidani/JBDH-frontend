import React from 'react';

interface ButtonsCardProps {
  tSync: (key: string) => string;
}

const ButtonsCard: React.FC<ButtonsCardProps> = ({ tSync }) => (
  <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
    <button className="bg-blue-600 text-white px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-700 transition">{tSync('profilePage_match_now_button')}</button>
    <button className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-50 transition">{tSync('profilePage_manual_search_button')}</button>
    <a href="/saved-jobs" className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-50 transition flex items-center justify-center">Sparade uppdrag</a>
  </div>
);

export default ButtonsCard;
