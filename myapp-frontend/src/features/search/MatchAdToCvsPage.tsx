import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';

const MatchAdToCvsPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto mt-8 card">
      <h2 className="text-2xl font-bold mb-4">{tSync('matchAdToCvsPage_title')}</h2>
      <p>{tSync('matchAdToCvsPage_comingSoon')}</p>
    </div>
  );
};

export default MatchAdToCvsPage;
