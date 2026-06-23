import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { LocalDbService } from '../../db/LocalDbService';
import { SettingsService } from '../../db/SettingsService';
import { BACKEND_ROLE_TO_IDB } from '../../db/types';
import type { Role } from '../../db/types';
import { LLM_SETTINGS_EVENT } from '../../hooks/useLlmReady';
import { AI_PROVIDERS } from '../../ai/ai';
import type { AiProvider } from '../../ai/ai';
import { Button } from '../../components/ui/Button';
import { CheckboxGroup } from '../../components/ui/CheckboxGroup';
import { PageCard } from '../../components/common/PageCard';
import { PageWrapper, PageBackground } from '../../components/common';
import settingsBg from '../../assets/img/settings.png';

const AI_KEY_FIELDS: { provider: AiProvider; settingsKey: string; i18nKey: string; placeholder: string }[] = [
  { provider: 'openai',    settingsKey: 'openai_key',    i18nKey: 'ai_settings_openai_key',    placeholder: 'sk-…' },
  { provider: 'anthropic', settingsKey: 'anthropic_key', i18nKey: 'ai_settings_anthropic_key', placeholder: 'sk-ant-…' },
  { provider: 'gemini',    settingsKey: 'gemini_key',    i18nKey: 'ai_settings_gemini_key',    placeholder: 'AIza…' },
];

const BACKEND_ROLES = ['User', 'Recruiter', 'Manager'] as const;

function SavedBadge({ visible }: { visible: boolean }) {
  return (
    <span className={`text-xs text-green-600 font-medium transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      ✓ Sparat
    </span>
  );
}

const SettingsPage: React.FC = () => {
  const { user, refreshRoles } = useAuth();
  const { tSync, language, changeLanguage } = useTranslation();

  // ── AI settings ────────────────────────────────────────────────────────────
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');
  const [aiKeysSet, setAiKeysSet]   = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey]  = useState<string | null>(null);
  const [keyInputValue, setKeyInputValue] = useState('');
  const [ollamaUrl,   setOllamaUrl]   = useState('');
  const [ollamaModel, setOllamaModel] = useState('');
  const [aiSaved, setAiSaved] = useState(false);

  // ── Roles ──────────────────────────────────────────────────────────────────
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles ?? []);
  const [rolesSaved, setRolesSaved] = useState(false);

  // ── Load AI settings ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const provider = (await SettingsService.get('ai_provider')) as AiProvider | undefined;
      if (provider) setAiProvider(provider);
      const keysSet: Record<string, boolean> = {};
      for (const f of AI_KEY_FIELDS) {
        keysSet[f.settingsKey] = !!(await SettingsService.get(f.settingsKey));
      }
      setAiKeysSet(keysSet);
      const url   = await SettingsService.get('ollama_url');
      const model = await SettingsService.get('ollama_model');
      if (url)   setOllamaUrl(url);
      if (model) setOllamaModel(model);
    })();
  }, []);

  // Sync roles from BE user when logged in; fall back to local IDB account when not
  useEffect(() => {
    if (user) { setSelectedRoles(user.roles ?? []); return; }
    (async () => {
      const account = await LocalDbService.getAccount();
      if (!account) return;
      const idbToBackend = Object.fromEntries(
        Object.entries(BACKEND_ROLE_TO_IDB).map(([k, v]) => [v, k])
      );
      setSelectedRoles(account.role.map(r => idbToBackend[r]).filter(Boolean));
    })();
  }, [user]);

  // ── Flash "Sparat" helper ──────────────────────────────────────────────────
  const flashAiSaved  = () => { setAiSaved(true);   setTimeout(() => setAiSaved(false),   2000); };
  const flashRoleSaved = () => { setRolesSaved(true); setTimeout(() => setRolesSaved(false), 2000); };

  // ── Roles: save on change ──────────────────────────────────────────────────
  const handleRolesChange = async (newRoles: string[]) => {
    setSelectedRoles(newRoles);
    if (!user) return; // ej inloggad → spara bara lokalt i state
    const previousRoles = user.roles ?? [];
    try {
      await ApiService.updateAccountSettings({ updateRoles: newRoles });
      await refreshRoles();
      const idbRoles = newRoles.map(r => BACKEND_ROLE_TO_IDB[r]).filter(Boolean) as Role[];
      await LocalDbService.updateAccount({ role: idbRoles });
      // Auto-create own candidate when User role is newly added
      if (!previousRoles.includes('User') && newRoles.includes('User')) {
        const account = await LocalDbService.getAccount();
        if (account && !(await LocalDbService.getOwnCandidate(account.account_id))) {
          await LocalDbService.addCandidate({
            account_id: account.account_id,
            name: account.name || '',
            email: account.email || '',
            telephone: account.telephone || '',
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
      flashRoleSaved();
    } catch { /* ignore */ }
  };

  // ── Provider: save on click ────────────────────────────────────────────────
  const handleProviderClick = async (p: AiProvider) => {
    setAiProvider(p);
    await SettingsService.set('ai_provider', p);
    window.dispatchEvent(new CustomEvent(LLM_SETTINGS_EVENT));
    flashAiSaved();
  };

  // ── API key: save on blur ──────────────────────────────────────────────────
  const handleKeyBlur = async (settingsKey: string) => {
    if (keyInputValue.trim()) {
      await SettingsService.set(settingsKey, keyInputValue.trim());
      setAiKeysSet(prev => ({ ...prev, [settingsKey]: true }));
    } else {
      await SettingsService.delete(settingsKey);
      setAiKeysSet(prev => ({ ...prev, [settingsKey]: false }));
    }
    setEditingKey(null);
    setKeyInputValue('');
    window.dispatchEvent(new CustomEvent(LLM_SETTINGS_EVENT));
    flashAiSaved();
  };

  // ── Ollama: save each field on blur ───────────────────────────────────────
  const handleOllamaUrlBlur = async () => {
    await SettingsService.set('ollama_url', ollamaUrl);
    window.dispatchEvent(new CustomEvent(LLM_SETTINGS_EVENT));
    flashAiSaved();
  };

  const handleOllamaModelBlur = async () => {
    await SettingsService.set('ollama_model', ollamaModel);
    window.dispatchEvent(new CustomEvent(LLM_SETTINGS_EVENT));
    flashAiSaved();
  };

  return (
    <>
      <PageBackground imageUrl={settingsBg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="flex flex-col gap-6 relative z-10">

        {/* Language */}
        <PageCard title={tSync('account_language')}>
          <select
            value={language}
            onChange={e => changeLanguage(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sv">Svenska</option>
            <option value="en">English</option>
          </select>
        </PageCard>

        {/* Roles */}
        <PageCard title={tSync('account_roles')}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <CheckboxGroup
                options={BACKEND_ROLES.map(r => ({
                  value: r,
                  label: tSync(`role_${r === 'User' ? 'candidate' : r === 'Recruiter' ? 'recruiter' : 'sales'}`),
                }))}
                selected={selectedRoles}
                onChange={newRoles => {
                  if (!user) {
                    window.dispatchEvent(new CustomEvent('requireAccount'));
                    return;
                  }
                  handleRolesChange(newRoles);
                }}
                helpText={tSync('account_roles_help')}
              />
            </div>
            <SavedBadge visible={rolesSaved} />
          </div>
        </PageCard>

        {/* AI settings */}
        <PageCard title={tSync('ai_settings_title')}>
          <p className="text-xs text-slate-500 mb-4">{tSync('ai_settings_help')}</p>

          {/* Provider selector */}
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <label className="text-sm font-medium text-slate-700">{tSync('ai_settings_provider_label')}</label>
              <SavedBadge visible={aiSaved} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(AI_PROVIDERS) as [AiProvider, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleProviderClick(key)}
                  className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                    aiProvider === key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* API key fields (non-Ollama) */}
          {aiProvider !== 'ollama' && (
            <div className="flex flex-col gap-4">
              {AI_KEY_FIELDS.filter(f => f.provider === aiProvider).map(field => (
                <div key={field.settingsKey} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">{tSync(field.i18nKey)}</label>
                  {editingKey === field.settingsKey ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="password"
                        value={keyInputValue}
                        onChange={e => setKeyInputValue(e.target.value)}
                        onBlur={() => handleKeyBlur(field.settingsKey)}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        placeholder={field.placeholder}
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()} // prevent blur before click
                        onClick={() => { setEditingKey(null); setKeyInputValue(''); }}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        {tSync('ai_settings_cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                      <span className={`text-sm flex-1 ${aiKeysSet[field.settingsKey] ? 'text-green-600' : 'text-slate-400'}`}>
                        {aiKeysSet[field.settingsKey] ? tSync('ai_settings_key_set') : tSync('ai_settings_key_not_set')}
                      </span>
                      <Button variant="secondary" size="sm" onClick={() => { setEditingKey(field.settingsKey); setKeyInputValue(''); }}>
                        {tSync('ai_settings_change')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Ollama fields */}
          {aiProvider === 'ollama' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">{tSync('ai_settings_ollama_url')}</label>
                <input
                  data-testid="ollama-url-input"
                  type="text"
                  value={ollamaUrl}
                  onChange={e => setOllamaUrl(e.target.value)}
                  onBlur={handleOllamaUrlBlur}
                  placeholder={tSync('ai_settings_ollama_url_placeholder')}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">{tSync('ai_settings_ollama_model')}</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={e => setOllamaModel(e.target.value)}
                  onBlur={handleOllamaModelBlur}
                  placeholder={tSync('ai_settings_ollama_model_placeholder')}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </PageCard>

      </PageWrapper>
    </>
  );
};

export default SettingsPage;
