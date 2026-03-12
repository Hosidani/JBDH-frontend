import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/TranslationProvider';
import { useRoles } from '../../../hooks/useRoles';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

interface MenuItem {
  to: string;
  labelKey: string;
  roles: string[];
}

const MENU_ITEMS: MenuItem[] = [
  { to: '/profile',          labelKey: 'menu_profile',          roles: ['User'] },
  { to: '/seller-profile',   labelKey: 'menu_seller_profile',   roles: ['Manager'] },
  { to: '/matching',         labelKey: 'menu_matching',         roles: ['User'] },
  { to: '/search',           labelKey: 'menu_match_cv_ads',     roles: ['User'] },
  { to: '/saved-jobs',       labelKey: 'menu_saved_jobs',       roles: ['User'] },
  { to: '/add-job-ad',       labelKey: 'menu_post_ad',          roles: ['Recruiter', 'Manager'] },
  { to: '/match-ad-cvs',     labelKey: 'menu_match_ad_cvs',     roles: ['Recruiter', 'Manager'] },
  { to: '/compare-cv-jobad', labelKey: 'menu_match_cv_jobad',   roles: [] },
  { to: '/about',            labelKey: 'menu_how_it_works',     roles: [] },
  { to: '/settings',         labelKey: 'menu_settings',         roles: [] },
  { to: '/account',          labelKey: 'menu_account_settings', roles: [] },
];

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { user, logout } = useAuth();
  const { tSync } = useTranslation();
  const { hasAnyRole } = useRoles();
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
          {user && MENU_ITEMS.map(item => {
            const visible = item.roles.length === 0 || hasAnyRole(item.roles);
            if (!visible) return null;
            return (
              <Link key={item.to} to={item.to} className="text-left hover:underline" onClick={onClose}>
                {tSync(item.labelKey)}
              </Link>
            );
          })}
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
