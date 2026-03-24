import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common/Modal';
import { PageWrapper, PageBackground } from '../../components/common';
import accountSettingsBg from '../../assets/img/account_settings.png';

interface Organisation {
  id: number;
  name: string;
  role: string;
}

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
  organisations: Organisation[];
}

// Helper function to convert backend AccountType enum to string
const mapAccountTypeToString = (accountType: number | string): string => {
  if (typeof accountType === 'number') {
    return accountType === 0 ? 'Basic' : accountType === 1 ? 'Premium' : 'Basic';
  }
  return accountType || 'Basic';
};

const mapStringToAccountType = (accountTypeString: string): number => {
  return accountTypeString === 'Premium' ? 1 : 0;
};

interface FormData {
  accountName: string;
  accountEmail: string;
  accountPhone: string;
  preferredLanguage: string;
  accountType: string;
  roles: string[];
  organisations: Organisation[];
  acceptedTermsAndConditions: boolean;
}

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [accountSettings, setAccountSettings] = useState<AccountSettings | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [availableOrgs, setAvailableOrgs] = useState<Organisation[]>([]);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [filteredOrgs, setFilteredOrgs] = useState<Organisation[]>([]);
  const [formData, setFormData] = useState<FormData>({
    accountName: '',
    accountEmail: '',
    accountPhone: '',
    preferredLanguage: 'en',
    accountType: 'Basic',
    roles: [],
    organisations: [],
    acceptedTermsAndConditions: false,
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
        // Populate form data
        const initialFormData = {
          accountName: data.accountName || '',
          accountEmail: data.accountEmail || '',
          accountPhone: data.accountPhone || '',
          preferredLanguage: data.preferredLanguage || 'en',
          accountType: mapAccountTypeToString(data.accountType),
          roles: data.roles || [],
          organisations: data.organisations || [],
          acceptedTermsAndConditions: data.acceptedTermsAndConditions || false,
        };
        setFormData(initialFormData);
        setOriginalData(initialFormData);
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

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[] | Organisation[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!accountSettings || !originalData || accountSettings.isTerminated) return;

    setIsSaving(true);
    try {
      // Build update request with only changed fields
      const updateRequest: any = {};

      // Check basic fields for changes
      if (formData.accountName !== originalData.accountName) {
        updateRequest.accountName = formData.accountName;
      }
      if (formData.accountEmail !== originalData.accountEmail) {
        updateRequest.accountEmail = formData.accountEmail;
      }
      if (formData.accountPhone !== originalData.accountPhone) {
        updateRequest.accountPhone = formData.accountPhone;
      }
      if (formData.preferredLanguage !== originalData.preferredLanguage) {
        updateRequest.preferredLanguage = formData.preferredLanguage;
      }
      if (formData.accountType !== originalData.accountType) {
        updateRequest.accountType = mapStringToAccountType(formData.accountType);
      }
      if (formData.acceptedTermsAndConditions !== originalData.acceptedTermsAndConditions) {
        updateRequest.acceptedTermsAndConditions = formData.acceptedTermsAndConditions;
      }

      // Check roles for changes
      const rolesChanged = JSON.stringify(formData.roles.sort()) !== JSON.stringify(originalData.roles.sort());
      if (rolesChanged) {
        updateRequest.roles = formData.roles;
      }

      // For organisations, we'll need to calculate join/leave operations
      // For now, let's send all current organisation IDs as joinOrganisationIds
      const originalOrgIds = originalData.organisations.map(o => o.id).filter(id => id > 0);
      const currentOrgIds = formData.organisations.map(o => o.id).filter(id => id > 0);

      const joinIds = currentOrgIds.filter(id => !originalOrgIds.includes(id));
      const leaveIds = originalOrgIds.filter(id => !currentOrgIds.includes(id));

      if (joinIds.length > 0) {
        updateRequest.joinOrganisationIds = joinIds;
      }
      if (leaveIds.length > 0) {
        updateRequest.leaveOrganisationIds = leaveIds;
      }

      // Only send request if there are changes
      if (Object.keys(updateRequest).length > 0) {
        await ApiService.updateAccountSettings(updateRequest);
      }

      // Refresh account settings
      const updatedData = await ApiService.getAccountSettings();
      setAccountSettings(updatedData);
      const newFormData = {
        accountName: updatedData.accountName || '',
        accountEmail: updatedData.accountEmail || '',
        accountPhone: updatedData.accountPhone || '',
        preferredLanguage: updatedData.preferredLanguage || 'en',
        accountType: mapAccountTypeToString(updatedData.accountType),
        roles: updatedData.roles || [],
        organisations: updatedData.organisations || [],
        acceptedTermsAndConditions: updatedData.acceptedTermsAndConditions || false,
      };
      setFormData(newFormData);
      setOriginalData(newFormData);
      setIsEditing(false);
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
        setError('Failed to update account settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!originalData) return;
    // Reset form data to original values
    setFormData({ ...originalData });
    setIsEditing(false);
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

  const handleAddOrgClick = async () => {
    try {
      const response = await ApiService.getAvailableOrganisations();
      // Only show organisations where user is not already a member (role === "")
      const joinableOrgs = response.filter((org: Organisation) => org.role === "");
      setAvailableOrgs(joinableOrgs);
      setFilteredOrgs([]); // Start with empty filtered list
      setOrgSearchQuery(''); // Reset search query
      setShowOrgPicker(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load available organisations');
    }
  };

  const handleOrgSearch = (query: string) => {
    setOrgSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOrgs([]);
    } else {
      const filtered = availableOrgs.filter(org =>
        org.name.toLowerCase().startsWith(query.toLowerCase())
      );
      setFilteredOrgs(filtered);
    }
  };

  const joinOrganisation = async (orgId: number) => {
    setIsSaving(true);
    try {
      await ApiService.updateAccountSettings({ joinOrganisationIds: [orgId] });

      // Add a small delay to ensure backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh account settings
      const updatedData = await ApiService.getAccountSettings();

      // Force re-render by updating accountSettings first
      setAccountSettings(updatedData);
      const newFormData = {
        accountName: updatedData.accountName || '',
        accountEmail: updatedData.accountEmail || '',
        accountPhone: updatedData.accountPhone || '',
        preferredLanguage: updatedData.preferredLanguage || 'en',
        accountType: mapAccountTypeToString(updatedData.accountType),
        roles: updatedData.roles || [],
        organisations: updatedData.organisations || [],
        acceptedTermsAndConditions: updatedData.acceptedTermsAndConditions || false,
      };
      setFormData(newFormData);
      setOriginalData(newFormData); // This is crucial - update the original data too

      // Force a complete re-render
      setShowOrgPicker(false);
      setOrgSearchQuery(''); // Reset search when modal closes
      setFilteredOrgs([]);

      // If still no organisations showing, force reload the page data
      if (!updatedData.organisations || updatedData.organisations.length === 0) {
        // Let's try one more API call after a longer delay
        setTimeout(async () => {
          try {
            const finalCheck = await ApiService.getAccountSettings();
            if (finalCheck.organisations && finalCheck.organisations.length > 0) {
              setAccountSettings(finalCheck);
              const finalFormData = {
                accountName: finalCheck.accountName || '',
                accountEmail: finalCheck.accountEmail || '',
                accountPhone: finalCheck.accountPhone || '',
                preferredLanguage: finalCheck.preferredLanguage || 'en',
                accountType: mapAccountTypeToString(finalCheck.accountType),
                roles: finalCheck.roles || [],
                organisations: finalCheck.organisations || [],
                acceptedTermsAndConditions: finalCheck.acceptedTermsAndConditions || false,
              };
              setFormData(finalFormData);
              setOriginalData(finalFormData);
            }
          } catch (err) {
            console.error('Final check failed:', err);
          }
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organisation');
    } finally {
      setIsSaving(false);
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

  const roleLabel = (role: string) =>
    role === 'User' ? tSync('role_candidate') :
    role === 'Recruiter' ? tSync('role_recruiter') :
    role === 'Sales' ? tSync('role_sales') :
    role === 'Manager' ? tSync('role_admin') : role;

  return (
    <>
      <PageBackground imageUrl={accountSettingsBg} opacity={1} blur={0} />
      <PageWrapper className="flex flex-col gap-6 relative z-10">

        {/* Account Information */}
        <PageCard
          title={tSync('account_information')}
          action={!accountSettings.isTerminated && !isEditing
            ? <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>{tSync('button_edit')}</Button>
            : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label={tSync('account_name')}  value={isEditing ? formData.accountName  : accountSettings.accountName  || tSync('not_provided')} readOnly={!isEditing || accountSettings.isTerminated} onChange={v => handleInputChange('accountName', v)}  placeholder="Förnamn Efternamn" />
            <TextInput label={tSync('account_phone')} value={isEditing ? formData.accountPhone : accountSettings.accountPhone || tSync('not_provided')} readOnly={!isEditing || accountSettings.isTerminated} onChange={v => handleInputChange('accountPhone', v)} type="tel" placeholder="0709638741" />
            <TextInput label={tSync('account_email')} value={isEditing ? formData.accountEmail : accountSettings.accountEmail || tSync('not_provided')} readOnly={!isEditing || accountSettings.isTerminated} onChange={v => handleInputChange('accountEmail', v)} type="email" placeholder="email@service.com" />

            {/* Organisations */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{tSync('account_company')}</label>
              {isEditing && !accountSettings.isTerminated ? (
                <div>
                  {formData.organisations.map((org, index) => (
                    <div key={org.id || index} className="flex items-center justify-between p-2 border border-slate-200 rounded-md mb-2">
                      <span className="text-sm text-slate-900">{org.name} <span className="text-slate-400">({org.role})</span></span>
                      <Button variant="danger" size="sm" disabled={isSaving} onClick={async () => {
                        setIsSaving(true);
                        try {
                          await ApiService.updateAccountSettings({ leaveOrganisationIds: [org.id] });
                          const updatedData = await ApiService.getAccountSettings();
                          setAccountSettings(updatedData);
                          const newFormData = { accountName: updatedData.accountName || '', accountEmail: updatedData.accountEmail || '', accountPhone: updatedData.accountPhone || '', preferredLanguage: updatedData.preferredLanguage || 'en', accountType: mapAccountTypeToString(updatedData.accountType), roles: updatedData.roles || [], organisations: updatedData.organisations || [], acceptedTermsAndConditions: updatedData.acceptedTermsAndConditions || false };
                          setFormData(newFormData);
                          setOriginalData(newFormData);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to leave organisation');
                        } finally { setIsSaving(false); }
                      }}>Leave</Button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddOrgClick} disabled={isSaving} className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">+ Add Organisation</button>
                </div>
              ) : (
                <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm">
                  {accountSettings.organisations?.length > 0
                    ? accountSettings.organisations.map(org => <div key={org.id}>{org.name} ({org.role})</div>)
                    : <span className="text-slate-400">{tSync('no_organisations')}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Roles */}
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700 mb-2">{tSync('account_roles')}</p>
            <div className="flex flex-wrap gap-2">
              {accountSettings.roles?.length > 0
                ? accountSettings.roles.map(role => <Badge key={role} label={roleLabel(role)} color="blue" />)
                : <span className="text-slate-400 text-sm">No roles assigned</span>}
            </div>
          </div>

          {/* Terms */}
          {isEditing && !accountSettings.isTerminated && (
            <label className="flex items-center gap-2 mt-6 cursor-pointer">
              <input type="checkbox" checked={formData.acceptedTermsAndConditions} onChange={e => handleInputChange('acceptedTermsAndConditions', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-700">{tSync('terms_accept')}</span>
            </label>
          )}

          {/* Save / Cancel */}
          {isEditing && !accountSettings.isTerminated && (
            <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
              <Button variant="primary" loading={isSaving} onClick={handleSave}>{tSync('button_save')}</Button>
              <Button variant="secondary" disabled={isSaving} onClick={handleCancel}>{tSync('button_cancel')}</Button>
            </div>
          )}
        </PageCard>

        {/* Change Password */}
        <PageCard title={tSync('settingsPage_password_section_title')}>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput label={tSync('settingsPage_current_password_label')} value={currentPassword} onChange={setCurrentPassword} type="password" />
              <div />
              <TextInput label={tSync('settingsPage_new_password_label')}     value={newPassword}     onChange={setNewPassword}     type="password" />
              <TextInput label={tSync('settingsPage_confirm_password_label')} value={confirmPassword} onChange={setConfirmPassword} type="password" />
            </div>
            {pwMessage && (
              <p className={pwMessage.includes('Error') || pwMessage.includes('match') ? 'text-red-600 text-sm' : 'text-green-600 text-sm'}>
                {pwMessage}
              </p>
            )}
            <div className="pt-6 border-t border-slate-200">
              <Button type="submit" variant="primary" loading={pwLoading}>
                {tSync('settingsPage_change_password_button')}
              </Button>
            </div>
          </form>
        </PageCard>

        {/* Account Status */}
        <PageCard title={tSync('account_status')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">{tSync('account_type')}</span>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                <Badge label={String(accountSettings.accountType)} color={accountSettings.accountType === 'Premium' ? 'yellow' : 'gray'} />
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
              <Button variant="danger" loading={isTerminating} onClick={() => setShowTerminateConfirm(true)}>
                {tSync('button_terminate')}
              </Button>
            </div>
          )}
        </PageCard>

      </PageWrapper>

      {/* Organisation Picker Modal */}
      <Modal open={showOrgPicker} onClose={() => { setShowOrgPicker(false); setOrgSearchQuery(''); setFilteredOrgs([]); }} title="Join Organisation">
        <TextInput value={orgSearchQuery} onChange={handleOrgSearch} placeholder="Search organisations by name..." />
        <div className="space-y-2 max-h-60 overflow-y-auto mt-4">
          {orgSearchQuery.trim() === '' ? (
            <p className="text-slate-500 text-center py-4 text-sm">Type to search for organisations...</p>
          ) : filteredOrgs.length > 0 ? (
            filteredOrgs.map(org => (
              <button key={org.id} onClick={() => joinOrganisation(org.id)} disabled={isSaving} className="w-full text-left p-3 border border-slate-200 rounded-md hover:bg-slate-50 text-sm disabled:opacity-50">
                <div className="font-medium">{org.name}</div>
                <div className="text-slate-400">Click to join as Member</div>
              </button>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4 text-sm">{tSync('no_organisations_search_match')} "{orgSearchQuery}"</p>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="secondary" disabled={isSaving} onClick={() => { setShowOrgPicker(false); setOrgSearchQuery(''); setFilteredOrgs([]); }}>Cancel</Button>
        </div>
      </Modal>

      {/* Terminate Confirmation Modal */}
      <Modal open={showTerminateConfirm} onClose={() => setShowTerminateConfirm(false)} title={tSync('terminate_confirm_title')}>
        <p className="text-slate-700 mb-6 text-sm">{tSync('terminate_confirm_message')}</p>
        <div className="flex gap-3">
          <Button variant="danger" loading={isTerminating} onClick={handleTerminate} className="flex-1">{isTerminating ? 'Stänger...' : 'Ja, stäng'}</Button>
          <Button variant="secondary" disabled={isTerminating} onClick={() => setShowTerminateConfirm(false)} className="flex-1">{tSync('button_cancel')}</Button>
        </div>
      </Modal>
    </>
  );
};

export default AccountPage;
