import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import { LocalDbService } from '../../db/LocalDbService';
import { BACKEND_ROLE_TO_IDB } from '../../db/types';
import type { Role } from '../../db/types';
import { SettingsService } from '../../db/SettingsService';
import { LLM_SETTINGS_EVENT } from '../../hooks/useLlmReady';
import { AI_PROVIDERS } from '../../ai/ai';
import type { AiProvider } from '../../ai/ai';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CheckboxGroup } from '../../components/ui/CheckboxGroup';
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
  preferredLanguage: string;
  accountType: string | number; // Can be enum number from backend
  isTerminated: boolean;
  acceptedTermsAndConditions: boolean;
  roles: string[];
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
  preferredLanguage: string;
  accountType: string;
  roles: string[];
  acceptedTermsAndConditions: boolean;
}

const AccountPage: React.FC = () => {
  const { user, logout, refreshRoles } = useAuth();
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
    preferredLanguage: 'en',
    accountType: 'Basic',
    roles: [],
    acceptedTermsAndConditions: false,
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  // AI settings state
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');
  const [aiKeysSet, setAiKeysSet] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyInputValue, setKeyInputValue] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');

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
        // Populate form data
        const initialFormData = {
          accountName: data.accountName || '',
          accountEmail: data.accountEmail || '',
          accountPhone: data.accountPhone || '',
          preferredLanguage: data.preferredLanguage || 'en',
          accountType: mapAccountTypeToString(data.accountType),
          roles: data.roles || [],
          acceptedTermsAndConditions: data.acceptedTermsAndConditions || false,
        };
        setFormData(initialFormData);
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

  useEffect(() => {
    const loadAiSettings = async () => {
      const [provider, openaiKey, anthropicKey, geminiKey, url, model] = await Promise.all([
        SettingsService.get('ai_provider'),
        SettingsService.get('openai_key'),
        SettingsService.get('anthropic_key'),
        SettingsService.get('gemini_key'),
        SettingsService.get('ollama_url'),
        SettingsService.get('ollama_model'),
      ]);
      if (provider) setAiProvider(provider as AiProvider);
      setAiKeysSet({
        openai_key: !!openaiKey,
        anthropic_key: !!anthropicKey,
        gemini_key: !!geminiKey,
      });
      if (url) setOllamaUrl(url);
      if (model) setOllamaModel(model);
    };
    loadAiSettings().catch(() => {});
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveField = async (fields: Partial<Record<string, any>>) => {
    if (!accountSettings || accountSettings.isTerminated) return;
    try {
      await ApiService.updateAccountSettings(fields);
      await refreshRoles();
    } catch {
      // ignore silently
    }

    // Mirror relevant fields to IndexedDB Account
    try {
      const patch: Partial<{ name: string; email: string; telephone: string; role: Role[] }> = {};
      if ('accountName'  in fields) patch.name      = fields.accountName  ?? '';
      if ('accountEmail' in fields) patch.email     = fields.accountEmail ?? '';
      if ('accountPhone' in fields) patch.telephone = fields.accountPhone ?? '';
      if ('roles'        in fields) patch.role      = (fields.roles as string[] ?? [])
        .map(r => BACKEND_ROLE_TO_IDB[r])
        .filter((r): r is Role => !!r);

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
      await ApiService.terminateAccount();
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
        <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} />
        <PageWrapper>
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading account settings...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} />
        <PageWrapper>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!accountSettings) {
    return (
      <>
        <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} />
        <PageWrapper>
          <p className="text-gray-600">No account settings found.</p>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} />
      <PageWrapper className="flex flex-col gap-6 relative z-10">

        {/* Account Information */}
        <PageCard title={tSync('account_information')}>
          <div className="grid grid-cols-1 gap-4">
            <InfoRow
              label={tSync('account_name')}
              value={formData.accountName}
              readOnly={accountSettings.isTerminated}
              onChange={v => handleInputChange('accountName', v)}
              onBlur={() => saveField({ accountName: formData.accountName })}
              helpText={tSync('account_name_help')}
            />
            <InfoRow
              label={tSync('account_phone')}
              value={formData.accountPhone}
              readOnly={accountSettings.isTerminated}
              onChange={v => handleInputChange('accountPhone', v)}
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

          {/* Roles */}
          <div className="mt-6">
            <CheckboxGroup
              label={tSync('account_roles')}
              options={[
                { value: 'User',      label: tSync('role_candidate') },
                { value: 'Recruiter', label: tSync('role_recruiter') },
                { value: 'Manager',   label: tSync('role_sales') },
              ]}
              selected={formData.roles}
              onChange={async vals => {
                const wasUser = formData.roles.includes('User');
                const isUser = vals.includes('User');
                handleInputChange('roles', vals);
                await saveField({ roles: vals });
                if (!wasUser && isUser && user?.email) {
                  const account = await LocalDbService.getAccountByEmail(user.email);
                  if (account) {
                    const existing = await LocalDbService.getOwnCandidate(account.account_id);
                    if (!existing) {
                      await LocalDbService.addCandidate({
                        account_id: account.account_id,
                        name: account.name ?? '',
                        email: account.email ?? '',
                        telephone: account.telephone ?? '',
                        title: '',
                        location: '',
                        workplace: [],
                        employment_type: [],
                        available_from: '',
                        travel: false,
                        searchable: false,
                        is_own_candidate: true,
                      });
                    }
                  }
                }
              }}
              layout="row"
              helpText={tSync('account_roles_help')}
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

        {/* AI Settings */}
        <PageCard title={tSync('ai_settings_title')}>
          <p className="text-xs text-slate-500 mb-4">{tSync('ai_settings_help')}</p>
          <div className="flex flex-col gap-5">
            {/* Provider selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{tSync('ai_settings_provider_label')}</label>
              <select
                value={aiProvider}
                onChange={async e => {
                  const val = e.target.value as AiProvider;
                  setAiProvider(val);
                  await SettingsService.set('ai_provider', val);
                  window.dispatchEvent(new Event(LLM_SETTINGS_EVENT));
                }}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {(Object.entries(AI_PROVIDERS) as [AiProvider, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Key fields for cloud providers */}
            {(['openai', 'anthropic', 'gemini'] as AiProvider[]).map(p => {
              const keyName = `${p}_key` as const;
              const labelKey = `ai_settings_${p === 'openai' ? 'openai' : p === 'anthropic' ? 'anthropic' : 'gemini'}_key` as const;
              if (aiProvider !== p) return null;
              return (
                <div key={p} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">{tSync(labelKey)}</label>
                  {editingKey === keyName ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="password"
                        value={keyInputValue}
                        onChange={e => setKeyInputValue(e.target.value)}
                        placeholder={tSync('ai_settings_key_placeholder')}
                        autoFocus
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={async () => {
                          if (keyInputValue.trim()) {
                            await SettingsService.set(keyName, keyInputValue.trim());
                            setAiKeysSet(prev => ({ ...prev, [keyName]: true }));
                            window.dispatchEvent(new Event(LLM_SETTINGS_EVENT));
                          }
                          setEditingKey(null);
                          setKeyInputValue('');
                        }}
                      >
                        {tSync('ai_settings_save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingKey(null); setKeyInputValue(''); }}
                      >
                        {tSync('ai_settings_cancel')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                      <span className={`text-sm flex-1 ${aiKeysSet[keyName] ? 'text-green-700' : 'text-slate-400'}`}>
                        {aiKeysSet[keyName] ? `● ● ● ● ● ● ● ●  ${tSync('ai_settings_key_set')}` : tSync('ai_settings_key_not_set')}
                      </span>
                      <button
                        onClick={() => { setEditingKey(keyName); setKeyInputValue(''); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {tSync('ai_settings_change')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ollama fields */}
            {aiProvider === 'ollama' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">{tSync('ai_settings_ollama_url')}</label>
                  <input
                    type="url"
                    value={ollamaUrl}
                    onChange={e => setOllamaUrl(e.target.value)}
                    onBlur={async () => { await SettingsService.set('ollama_url', ollamaUrl); }}
                    placeholder={tSync('ai_settings_ollama_url_placeholder')}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">{tSync('ai_settings_ollama_model')}</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={e => setOllamaModel(e.target.value)}
                    onBlur={async () => { await SettingsService.set('ollama_model', ollamaModel); }}
                    placeholder={tSync('ai_settings_ollama_model_placeholder')}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
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

      {/* Terminate Confirmation Modal */}
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
