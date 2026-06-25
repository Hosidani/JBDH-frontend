import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/TranslationProvider';
import { useRoles } from '../../../hooks/useRoles';
import { useLocalAccountContext } from '../../../context/LocalAccountContext';
import { Icon } from '../../ui/Icon';
import { LocalDbService } from '../../../db/LocalDbService';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

interface MenuItem {
  to: string;
  labelKey: string;
  /**
   * BE roles required (checked when logged in to BE).
   * null  = visible to everyone
   * []    = any BE-authenticated user
   * [...] = BE users with at least one of these roles
   */
  roles: string[] | null;
  /**
   * When defined, the item is also accessible without a BE account,
   * visibility is then based on the local account's roles.
   * null  = any local account holder
   * [...] = local account holders with at least one of these roles
   */
  localRoles?: string[] | null;
  /** Show with a lock icon when not logged in to BE (item REQUIRES BE). */
  beGated?: boolean;
  old?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Always visible to local account holders
  { to: '/settings',         labelKey: 'menu_settings',             roles: null },
  // Requires BE — hidden (not locked) when no BE login
  { to: '/account',          labelKey: 'menu_account_details',      roles: [] },
  // Accessible with local account + kandidat role; no lock needed
  { to: '/my-profile',       labelKey: 'menu_my_profile',           roles: ['User'],                 localRoles: ['User'] },
  // Manager/Recruiter — requires BE (locked when not logged in, role-filtered)
  { to: '/candidate_mgmt',   labelKey: 'menu_manage_candidates',    roles: ['Manager'],              localRoles: ['Manager'] },
  { to: '/cv_mgmt',          labelKey: 'menu_manage_candidate_cvs', roles: ['Manager', 'Recruiter'], localRoles: ['Manager', 'Recruiter'] },
  // Visible to all local account holders
  { to: '/jobs_mgmt',        labelKey: 'menu_manage_ads',           roles: null },
  // Recruiter-only, requires BE
  { to: '/add-job-ad',       labelKey: 'menu_post_ad',              roles: ['Recruiter'],            beGated: true },
  { to: '/ats-results',      labelKey: 'menu_ats_results',          roles: ['Recruiter', 'Manager'], beGated: true },
  // Accessible with any local account — no BE needed, no lock
  { to: '/jobs-and-cvs',     labelKey: 'menu_multi_match',          roles: [],                       localRoles: null },
  // Kandidat — requires BE (locked)
  { to: '/search',           labelKey: 'menu_match_cv_ads',         roles: ['User'],                 beGated: true },
  { to: '/saved-jobs',       labelKey: 'menu_saved_jobs',           roles: ['User'],                 beGated: true },
  // Accessible with any local account — no BE needed, no lock
  { to: '/messages',         labelKey: 'menu_messages',             roles: [],                       localRoles: null },
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
  const { hasLocalAccount, hasBeAccount, localRoles, allAccounts } = useLocalAccountContext();
  const [nukeConfirm, setNukeConfirm] = useState(false);

  if (!isOpen) return null;

  // ── Minimal meny — inget lokalt konto ännu ─────────────────────────────────
  if (!hasLocalAccount) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-30" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-lg mt-8 mr-8 p-6 w-[331px] relative" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg">{tSync('menu_title')}</span>
            <button onClick={onClose} className="text-2xl leading-none">&times;</button>
          </div>
          <nav className="flex flex-col gap-3">
            <button className="text-left hover:underline" onClick={() => { onClose(); onOpenLogin(); }}>
              {tSync('menu_login')}
            </button>
            <Link to="/onboarding" className="text-left hover:underline" onClick={onClose}>
              {tSync('menu_get_started')}
            </Link>
            <Link to="/about" className="text-left hover:underline" onClick={onClose}>
              {tSync('menu_how_it_works')}
            </Link>
          </nav>
        </div>
      </div>
    );
  }

  const isVisible = (item: MenuItem): boolean => {
    // Items with localRoles are accessible without a BE account
    if (!isLoggedIn && item.localRoles !== undefined) {
      if (item.localRoles === null) return true; // any local account holder
      return localRoles.some(r => item.localRoles!.includes(r));
    }

    // beGated items — show with lock icon when not logged in to BE
    if (item.beGated) {
      if (!isLoggedIn) {
        // Filter by local role so Manager-only items stay hidden for kandidat
        if (!item.roles || item.roles.length === 0) return true;
        return localRoles.some(r => item.roles!.includes(r));
      }
      if (!item.roles || item.roles.length === 0) return true;
      return hasAnyRole(item.roles);
    }

    // Standard BE role check
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
              {!hasBeAccount && (
                <Link to="/register" className="text-left hover:underline" onClick={onClose}>
                  {tSync('menu_register')}
                </Link>
              )}
            </>
          )}

          {!user && allAccounts.length >= 2 && (
            <Link to="/local_accounts" className="text-left hover:underline" onClick={onClose}>
              {tSync('menu_manage_local_accounts')}
            </Link>
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

          {/* Ta bort all lokal data */}
          <div className="border-t border-slate-100 pt-2 mt-1">
            {nukeConfirm ? (
              <button
                className="text-left text-red-700 font-semibold hover:underline w-full"
                onClick={async () => {
                  await LocalDbService.nukeLocalData();
                  window.location.reload();
                }}
              >
                {tSync('menu_nuke_local_data_confirm')}
              </button>
            ) : (
              <button
                className="text-left text-red-500 hover:underline w-full"
                onClick={() => setNukeConfirm(true)}
              >
                {tSync('menu_nuke_local_data')}
              </button>
            )}
          </div>

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
