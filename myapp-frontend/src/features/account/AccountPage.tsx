import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';

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
  const { user, logout, refreshRoles } = useAuth();
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
          if (err.message.includes('401') || err.message.includes('Account has been terminated')) {
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

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
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
        updateRequest.updateRoles = formData.roles;
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
      if (rolesChanged) {
        await refreshRoles();
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Account has been terminated')) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!accountSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No account settings found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              {tSync('menu_account_settings')}
            </h1>
          </div>
          
          <div className="p-6">
            {/* Main Account Information Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {tSync('account_information')}
                </h2>
                {!accountSettings.isTerminated && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tSync('button_edit')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tSync('account_name')}
                    </label>
                    {isEditing && !accountSettings.isTerminated ? (
                      <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                        placeholder="Förnamn Efternamn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {accountSettings.accountName || tSync('not_provided')}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tSync('account_phone')}
                    </label>
                    {isEditing && !accountSettings.isTerminated ? (
                      <input
                        type="tel"
                        value={formData.accountPhone}
                        onChange={(e) => handleInputChange('accountPhone', e.target.value)}
                        placeholder="0709638741"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {accountSettings.accountPhone || tSync('not_provided')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tSync('account_email')}
                    </label>
                    {isEditing && !accountSettings.isTerminated ? (
                      <input
                        type="email"
                        value={formData.accountEmail}
                        onChange={(e) => handleInputChange('accountEmail', e.target.value)}
                        placeholder="email@service.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {accountSettings.accountEmail || tSync('not_provided')}
                      </div>
                    )}
                  </div>

                  {/* Company/Organisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tSync('account_company')}
                    </label>
                    {isEditing && !accountSettings.isTerminated ? (
                      <div>
                        {formData.organisations.map((org, index) => (
                          <div key={org.id || index} className="flex items-center justify-between p-2 border border-gray-200 rounded-md mb-2">
                            <div>
                              <span className="font-medium">{org.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({org.role})</span>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                setIsSaving(true);
                                try {
                                  await ApiService.updateAccountSettings({ leaveOrganisationIds: [org.id] });
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
                                  setOriginalData(newFormData); // Update original data here too
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Failed to leave organisation');
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              disabled={isSaving}
                              className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Leave
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddOrgClick}
                          disabled={isSaving}
                          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          + Add Organisation
                        </button>
                      </div>
                    ) : (
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {accountSettings.organisations && accountSettings.organisations.length > 0 ? (
                          accountSettings.organisations.map(org => (
                            <div key={org.id} className="mb-1">
                              {org.name} ({org.role})
                            </div>
                          ))
                        ) : (
                          <span>{tSync('no_organisations')}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Roles Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {tSync('account_roles')}
                </label>
                
                {!isEditing || accountSettings.isTerminated ? (
                  <div className="flex flex-wrap gap-2">
                    {accountSettings.roles?.length > 0 ? (
                      accountSettings.roles.map(role => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {role === 'User' ? tSync('role_candidate') : 
                           role === 'Recruiter' ? tSync('role_recruiter') : 
                           role === 'Sales' ? tSync('role_sales') : 
                           role === 'Manager' ? tSync('role_admin') : role}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No roles assigned</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: 'User', label: tSync('role_candidate') },
                      { key: 'Recruiter', label: tSync('role_recruiter') },
                      { key: 'Sales', label: tSync('role_sales') },
                      { key: 'Manager', label: tSync('role_admin') }
                    ].map(role => (
                      <label key={role.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.key)}
                          onChange={(e) => handleRoleChange(role.key, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {role.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              {isEditing && !accountSettings.isTerminated && (
                <div className="mt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptedTermsAndConditions}
                      onChange={(e) => handleInputChange('acceptedTermsAndConditions', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tSync('terms_accept')}</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && !accountSettings.isTerminated && (
                <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Sparar...' : tSync('button_save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tSync('button_cancel')}
                  </button>
                </div>
              )}
            </div>

            {/* Account Status Section */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {tSync('account_status')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tSync('account_type')}
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      accountSettings.accountType === 'Premium' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {accountSettings.accountType}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      accountSettings.isTerminated 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {accountSettings.isTerminated ? 'Terminated' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terminate Account Button */}
              {!accountSettings.isTerminated && (
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setShowTerminateConfirm(true)}
                    disabled={isTerminating}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTerminating ? 'Stänger...' : tSync('button_terminate')}
                  </button>
                </div>
              )}
            </div>

            {/* Organisation Picker Modal */}
            {showOrgPicker && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Join Organisation
                  </h3>
                  
                  {/* Search Input */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={orgSearchQuery}
                      onChange={(e) => handleOrgSearch(e.target.value)}
                      placeholder="Search organisations by name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>

                  {/* Organisation List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orgSearchQuery.trim() === '' ? (
                      <p className="text-gray-500 text-center py-4">Type to search for organisations...</p>
                    ) : filteredOrgs.length > 0 ? (
                      filteredOrgs.map(org => (
                        <button
                          key={org.id}
                          onClick={() => joinOrganisation(org.id)}
                          disabled={isSaving}
                          className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-gray-500">Click to join as Member</div>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">{tSync('no_organisations_search_match')} "{orgSearchQuery}"</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        setShowOrgPicker(false);
                        setOrgSearchQuery('');
                        setFilteredOrgs([]);
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Terminate Account Confirmation Modal */}
            {showTerminateConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                    {tSync('terminate_confirm_title')}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {tSync('terminate_confirm_message')}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleTerminate}
                      disabled={isTerminating}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTerminating ? 'Stänger...' : 'Ja, stäng'}
                    </button>
                    <button
                      onClick={() => setShowTerminateConfirm(false)}
                      disabled={isTerminating}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tSync('button_cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;