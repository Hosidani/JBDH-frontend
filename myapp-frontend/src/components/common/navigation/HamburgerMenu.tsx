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
  /**
   * null  = visible to everyone including unauthenticated users
   * []    = visible to all authenticated users
   * [...] = visible only if user has at least one of these roles
   */
  roles: string[] | null;
}

const MENU_ITEMS: MenuItem[] = [
  { to: '/account',          labelKey: 'menu_account_settings', roles: [] },
  { to: '/profile',          labelKey: 'menu_profile',          roles: ['User'] },
  { to: '/search',           labelKey: 'menu_match_cv_ads',     roles: ['User'] },
  { to: '/saved-jobs',       labelKey: 'menu_saved_jobs',       roles: ['User'] },
  { to: '/compare-cv-jobad', labelKey: 'menu_match_cv_jobad',   roles: ['User'] },
  { to: '/add-job-ad',       labelKey: 'menu_post_ad',          roles: ['Recruiter'] },
  { to: '/jobs-and-cvs',     labelKey: 'menu_multi_match',      roles: ['Recruiter', 'Manager'] },
  { to: '/ats-results',      labelKey: 'menu_ats_results',       roles: ['Recruiter', 'Manager'] },
  { to: '/cv_mgmt',          labelKey: 'menu_manage_candidate_cvs', roles: ['Manager'] },
  { to: '/jobs_mgmt',        labelKey: 'menu_manage_ads',           roles: ['Manager'] },
  { to: '/messages',         labelKey: 'menu_messages',         roles: [] },
  { to: '/about',            labelKey: 'menu_how_it_works',     roles: null },
];

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { user, logout } = useAuth();
  const { tSync } = useTranslation();
  const { hasAnyRole, isLoggedIn } = useRoles();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isVisible = (item: MenuItem): boolean => {
    if (item.roles === null) return true;
    if (item.roles.length === 0) return isLoggedIn;
    return hasAnyRole(item.roles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg mt-8 mr-8 p-6 w-64 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">{tSync('menu_title')}</span>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>
        <nav className="flex flex-col gap-3">
          {!user && (
            <>
              <button className="text-left hover:underline" onClick={() => { onClose(); onOpenLogin(); }}>
                {tSync('menu_login')}
              </button>
              <Link to="/register" className="text-left hover:underline" onClick={onClose}>
                {tSync('menu_register')}
              </Link>
            </>
          )}

          {MENU_ITEMS.filter(isVisible).map(item => (
            <Link key={item.to} to={item.to} className="text-left hover:underline" onClick={onClose}>
              {tSync(item.labelKey)}
            </Link>
          ))}

          {user && (
            <button
              className="text-left text-red-600 mt-2 flex items-center gap-2 hover:underline"
              onClick={() => { logout(); onClose(); navigate('/'); }}
            >
              {tSync('menu_logout')} <span style={{ fontSize: 18 }}>&#8594;</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
