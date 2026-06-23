import React, { useState } from 'react';
import { PageBackground, PageWrapper, Modal } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useLocalAccountContext } from '../../context/LocalAccountContext';
import { LocalDbService } from '../../db/LocalDbService';
import { BACKEND_ROLE_TO_IDB } from '../../db/types';
import settingsBg from '../../assets/img/settings.png';

const IDB_TO_BACKEND = Object.fromEntries(
  Object.entries(BACKEND_ROLE_TO_IDB).map(([k, v]) => [v, k])
);

const LocalAccountsPage: React.FC = () => {
  const { tSync } = useTranslation();
  const { allAccounts, currentAccountId, refreshLocalAccount } = useLocalAccountContext();

  const [selectedId, setSelectedId]     = useState<string | undefined>(currentAccountId);
  const [confirmId,  setConfirmId]      = useState<string | null>(null);
  const [deleting,   setDeleting]       = useState(false);
  const [switching,  setSwitching]      = useState(false);

  const canSwitch = !!selectedId && selectedId !== currentAccountId;

  const handleSwitch = async () => {
    if (!selectedId) return;
    setSwitching(true);
    LocalDbService.setActiveAccount(selectedId);
    await refreshLocalAccount();
    setSwitching(false);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await LocalDbService.deleteAccountById(confirmId);
      if (confirmId === selectedId) setSelectedId(undefined);
      await refreshLocalAccount();
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const roleLabel = (idbRole: string) => {
    const be = IDB_TO_BACKEND[idbRole];
    if (be === 'User')    return tSync('local_accounts_role_candidate');
    if (be === 'Manager') return tSync('local_accounts_role_seller');
    return be ?? idbRole;
  };

  return (
    <>
      <PageBackground imageUrl={settingsBg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <PageCard
          title={tSync('local_accounts_title')}
          action={
            <Button
              variant="primary"
              size="sm"
              loading={switching}
              disabled={!canSwitch}
              onClick={handleSwitch}
            >
              {tSync('local_accounts_switch_btn')}
            </Button>
          }
        >
          {allAccounts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">{tSync('local_accounts_empty')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              {allAccounts.map(account => {
                const isActive   = account.account_id === currentAccountId;
                const isSelected = account.account_id === selectedId;
                return (
                  <li
                    key={account.account_id}
                    onClick={() => setSelectedId(account.account_id)}
                    className={`group flex items-center gap-3 py-3 px-2 rounded-md cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                  >
                    <input
                      type="radio"
                      name="selected-account"
                      checked={isSelected}
                      onChange={() => setSelectedId(account.account_id)}
                      onClick={e => e.stopPropagation()}
                      className="text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {account.name || '—'}
                        </span>
                        {isActive && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0">
                            {tSync('local_accounts_active_badge')}
                          </span>
                        )}
                      </div>
                      {account.role.length > 0 && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {account.role.map(roleLabel).join(', ')}
                        </p>
                      )}
                      {account.email && (
                        <p className="text-xs text-slate-400 mt-0.5">{account.email}</p>
                      )}
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); setConfirmId(account.account_id); }}
                      title={tSync('local_accounts_delete_title')}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                    >
                      <Icon name="delete" size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </PageCard>
      </PageWrapper>

      <Modal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title={tSync('local_accounts_delete_title')}
      >
        <p className="text-sm text-slate-600 mb-6">{tSync('local_accounts_delete_confirm')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmId(null)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="danger" size="lg" loading={deleting} onClick={handleDeleteConfirm}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default LocalAccountsPage;
