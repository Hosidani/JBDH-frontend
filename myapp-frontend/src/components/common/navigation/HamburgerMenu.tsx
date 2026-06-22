import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/TranslationProvider';
import { useRoles } from '../../../hooks/useRoles';
import { Icon } from '../../ui/Icon';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

interface MenuItem {
  to: string;
  labelKey: string;
  /**
   * null     = visible to everyone including unauthenticated users
   * []       = visible to all authenticated users
   * [...]    = visible only if user has at least one of these roles
   * beGated  = always shown; lock icon displayed when not logged in
   */
  roles: string[] | null;
  beGated?: boolean;
  old?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Shared top items
  { to: '/settings',         labelKey: 'menu_settings',             roles: null },
  { to: '/account',          labelKey: 'menu_account_details',      roles: [],                     beGated: true },
  // User/Kandidat only — hidden for Manager-only
  { to: '/my-profile',       labelKey: 'menu_my_profile',           roles: ['User'],               beGated: true },
  // Manager/Recruiter items (hidden for Kandidat)
  { to: '/candidate_mgmt',   labelKey: 'menu_manage_candidates',    roles: ['Manager'],            beGated: true },
  { to: '/cv_mgmt',          labelKey: 'menu_manage_candidate_cvs', roles: ['Manager', 'Recruiter'] },
  // Shared middle items
  { to: '/jobs_mgmt',        labelKey: 'menu_manage_ads',           roles: null },
  { to: '/add-job-ad',       labelKey: 'menu_post_ad',              roles: ['Recruiter'],          beGated: true },
  { to: '/ats-results',      labelKey: 'menu_ats_results',          roles: ['Recruiter', 'Manager'], beGated: true },
  { to: '/jobs-and-cvs',     labelKey: 'menu_multi_match',          roles: [],                     beGated: true },
  // Kandidat-specific items (hidden for Manager-only)
  { to: '/search',           labelKey: 'menu_match_cv_ads',         roles: ['User'],               beGated: true },
  { to: '/saved-jobs',       labelKey: 'menu_saved_jobs',           roles: ['User'],               beGated: true },
  // Bottom items — shown near logout
  { to: '/messages',         labelKey: 'menu_messages',             roles: [],                     beGated: true },
  { to: '/about',            labelKey: 'menu_how_it_works',         roles: null },
  // Deprecated
  { to: '/compare-cv-jobad', labelKey: 'menu_match_cv_jobad',       roles: null,     old: true },
  { to: '/profile',          labelKey: 'menu_profile',              roles: ['User'], old: true },
];

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { user, logout } = useAuth();
  const { tSync } = useTranslation();
  const { hasAnyRole, isLoggedIn } = useRoles();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isVisible = (item: MenuItem): boolean => {
    if (item.beGated) {
      if (!isLoggedIn) return true; // show with lock to unauthenticated
      if (!item.roles || item.roles.length === 0) return true; // all authenticated
      return hasAnyRole(item.roles);
    }
    if (item.roles === null) return true;
    if (item.roles.length === 0) return isLoggedIn;
    return hasAnyRole(item.roles);
  };

  const isLocked = (item: MenuItem): boolean =>
    !!item.beGated && !isLoggedIn;

  const renderItem = (item: MenuItem) => {
    const locked = isLocked(item);
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`text-left flex items-center gap-2 hover:underline ${locked ? 'text-slate-400' : ''}`}
        onClick={onClose}
      >
        {locked && <Icon name="lock" size={14} />}
        {tSync(item.labelKey)}
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg mt-8 mr-8 p-6 w-[331px] relative" onClick={e => e.stopPropagation()}>
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

          {MENU_ITEMS.filter(item => !item.old).filter(isVisible).map(renderItem)}

          {user && (
            <button
              className="text-left text-red-600 mt-2 flex items-center gap-2 hover:underline"
              onClick={() => { logout(); onClose(); navigate('/'); }}
            >
              {tSync('menu_logout')} <span style={{ fontSize: 18 }}>&#8594;</span>
            </button>
          )}

          {MENU_ITEMS.filter(item => item.old).filter(isVisible).map(item => (
            <Link key={item.to} to={item.to} className="text-left hover:underline text-slate-400" onClick={onClose}>
              {tSync(item.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
