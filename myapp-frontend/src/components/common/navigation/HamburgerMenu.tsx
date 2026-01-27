import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/TranslationProvider';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { user, logout } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg mt-8 mr-8 p-6 w-64 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">{tSync('menu_title')}</span>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>
        <nav className="flex flex-col gap-3">
          {!user && (
            <button className="text-left hover:underline" onClick={() => { onClose(); onOpenLogin(); }}>{tSync('menu_login')}</button>
          )}
          {user && (
            <>
              <Link to="/profile" className="text-left hover:underline" onClick={onClose}>{tSync('menu_profile')}</Link>
              <Link to="/settings" className="text-left hover:underline" onClick={onClose}>{tSync('menu_settings')}</Link>
              <Link to="/account" className="text-left hover:underline" onClick={onClose}>{tSync('menu_account_settings')}</Link>
            </>
          )}
          <Link to="/search" className="text-left hover:underline" onClick={onClose}>{tSync('menu_match_cv_ads')}</Link>
          <Link to="/add-job-ad" className="text-left hover:underline" onClick={onClose}>{tSync('menu_post_ad')}</Link>
          <Link to="/compare-cv-jobad" className="text-left hover:underline" onClick={onClose}>{tSync('menu_match_cv_jobad')}</Link>
          <Link to="/about" className="text-left hover:underline" onClick={onClose}>{tSync('menu_how_it_works')}</Link>
          {user && (
            <button className="text-left text-red-600 mt-2 flex items-center gap-2 hover:underline" onClick={() => { logout(); navigate('/'); }}>
              {tSync('menu_logout')} <span style={{ fontSize: 18 }}>&#8594;</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
