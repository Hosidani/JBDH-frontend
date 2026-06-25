import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import { LocalDbService } from '../../db/LocalDbService';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { InfoRow } from '../../components/common/InfoRow';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common/Modal';
import { PageWrapper, PageBackground } from '../../components/common';
import accountSettingsBg from '../../assets/img/account_settings.png';

interface AccountSettings {
  id: number;
  userId: number;
  accountName: string;
  accountEmail: string;
  accountPhone: string;
  accountType: string | number;
  isTerminated: boolean;
  acceptedTermsAndConditions: boolean;
}

const ACCOUNT_TYPE_MAP: Record<number, string> = { 0: 'free', 1: 'basic', 2: 'silver', 3: 'gold' };

const mapAccountTypeToString = (accountType: number | string): string => {
  if (typeof accountType === 'number') return ACCOUNT_TYPE_MAP[accountType] ?? 'free';
  const normalized = String(accountType).toLowerCase();
  return Object.values(ACCOUNT_TYPE_MAP).includes(normalized) ? normalized : 'free';
};

interface FormData {
  accountName: string;
  accountEmail: string;
  accountPhone: string;
}

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [accountSettings, setAccountSettings] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    accountName: '',
    accountEmail: '',
    accountPhone: '',
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountSettings = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      try {
        const data = await ApiService.getAccountSettings();
        setAccountSettings(data);
        setFormData({
          accountName: data.accountName || '',
          accountEmail: data.accountEmail || '',
          accountPhone: data.accountPhone || '',
        });
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('Account has been terminated')) {
            setError('Account has been terminated.');
          } else if (err.message.includes('404') || err.message.includes('No account found')) {
            setError('No account found for user.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Failed to fetch account settings');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAccountSettings();
  }, [user]);

  const saveField = async (fields: Partial<Record<string, any>>) => {
    if (!accountSettings || accountSettings.isTerminated) return;
    try {
      await ApiService.updateAccountSettings(fields);
    } catch {
      // ignore silently
    }
    try {
      const patch: Partial<{ name: string; telephone: string }> = {};
      if ('accountName'  in fields) patch.name      = fields.accountName  ?? '';
      if ('accountPhone' in fields) patch.telephone = fields.accountPhone ?? '';
      if (Object.keys(patch).length > 0) {
        await LocalDbService.updateAccount(patch);
      }
    } catch {
      // IndexedDB errors must not affect UI
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage(tSync('settingsPage_passwords_no_match'));
      return;
    }
    setPwLoading(true);
    try {
      await ApiService.changePassword(currentPassword, newPassword, confirmPassword);
      setPwMessage(tSync('settingsPage_password_updated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage(err?.message || 'Error changing password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleTerminate = async () => {
    setIsTerminating(true);
    try {
      await ApiService.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate account');
    } finally {
      setIsTerminating(false);
      setShowTerminateConfirm(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} className="!z-[2]" />
        <PageWrapper className="relative z-10">
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          </div>
        </PageWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} className="!z-[2]" />
        <PageWrapper className="relative z-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600">{error}</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!accountSettings) return null;

  return (
    <>
      <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="flex flex-col gap-6 relative z-10">

        {/* Account details */}
        <PageCard title={tSync('account_details_title')}>
          <div className="grid grid-cols-1 gap-4">
            <InfoRow
              label={tSync('account_name')}
              value={formData.accountName}
              readOnly={accountSettings.isTerminated}
              onChange={v => setFormData(prev => ({ ...prev, accountName: v }))}
              onBlur={() => saveField({ accountName: formData.accountName })}
              helpText={tSync('account_name_help')}
            />
            <InfoRow
              label={tSync('account_phone')}
              value={formData.accountPhone}
              readOnly={accountSettings.isTerminated}
              onChange={v => setFormData(prev => ({ ...prev, accountPhone: v }))}
              onBlur={() => saveField({ accountPhone: formData.accountPhone })}
              type="tel"
              helpText={tSync('account_phone_help')}
            />
            <InfoRow
              label={tSync('account_email')}
              value={formData.accountEmail}
              readOnly
              type="email"
              helpText={tSync('account_email_help')}
            />
          </div>
        </PageCard>

        {/* Change Password */}
        <PageCard title={tSync('settingsPage_password_section_title')}>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4">
              <TextInput label={tSync('settingsPage_current_password_label')} value={currentPassword} onChange={setCurrentPassword} type="password" showToggle />
              <div />
              <TextInput label={tSync('settingsPage_new_password_label')}     value={newPassword}     onChange={setNewPassword}     type="password" showToggle />
              <TextInput label={tSync('settingsPage_confirm_password_label')} value={confirmPassword} onChange={setConfirmPassword} type="password" showToggle />
            </div>
            {pwMessage && (
              <p className={pwMessage.includes('Error') || pwMessage.includes('match') ? 'text-red-600 text-sm' : 'text-green-600 text-sm'}>
                {pwMessage}
              </p>
            )}
            <div className="pt-6 border-t border-slate-200">
              <Button type="submit" variant="primary" size="lg" loading={pwLoading} disabled={!newPassword || newPassword !== confirmPassword}>
                {tSync('settingsPage_change_password_button')}
              </Button>
            </div>
          </form>
        </PageCard>

        {/* Account Status */}
        <PageCard title={tSync('account_status')}>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">{tSync('account_type')}</span>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                {(() => {
                  const key = mapAccountTypeToString(accountSettings.accountType);
                  const colorMap: Record<string, 'gray' | 'blue' | 'purple' | 'yellow'> = { free: 'gray', basic: 'blue', silver: 'purple', gold: 'yellow' };
                  return <Badge label={tSync(`accountType_${key}`)} color={colorMap[key] ?? 'gray'} />;
                })()}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                <Badge label={accountSettings.isTerminated ? 'Terminated' : 'Active'} color={accountSettings.isTerminated ? 'red' : 'green'} />
              </div>
            </div>
          </div>
          {!accountSettings.isTerminated && (
            <div className="pt-6 border-t border-slate-200 mt-6">
              <Button variant="danger" size="lg" loading={isTerminating} onClick={() => setShowTerminateConfirm(true)}>
                {tSync('button_terminate')}
              </Button>
            </div>
          )}
        </PageCard>

      </PageWrapper>

      <Modal open={showTerminateConfirm} onClose={() => setShowTerminateConfirm(false)} title={tSync('terminate_confirm_title')}>
        <p className="text-slate-700 text-sm mb-3">{tSync('terminate_confirm_message')}</p>
        <p className="text-slate-700 text-sm mb-3">{tSync('terminate_confirm_message_2')}</p>
        <p className="text-slate-700 text-sm mb-6">{tSync('terminate_confirm_message_3')}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="lg" disabled={isTerminating} onClick={() => setShowTerminateConfirm(false)}>{tSync('button_cancel')}</Button>
          <Button variant="danger" size="lg" loading={isTerminating} onClick={handleTerminate}>{tSync('terminate_confirm_ok')}</Button>
        </div>
      </Modal>
    </>
  );
};

export default AccountPage;
