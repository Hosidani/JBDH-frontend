import React from 'react';
import { Button } from '../ui/Button';

interface ButtonsCardProps {
  tSync: (key: string) => string;
  onManualSearchClick?: () => void;
}

const ButtonsCard: React.FC<ButtonsCardProps> = ({ tSync, onManualSearchClick }) => (
  <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
    <Button variant="secondary" size="lg" onClick={onManualSearchClick}>{tSync('profilePage_manual_search_button')}</Button>
    <Button variant="secondary" size="lg" onClick={() => { window.location.href = '/saved-jobs'; }}>{tSync('menu_saved_jobs')}</Button>
  </div>
);

export default ButtonsCard;
