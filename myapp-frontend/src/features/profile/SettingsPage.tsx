import React, { useState } from 'react';

import PageWrapper from '../../components/PageWrapper';
import PageBackground from '../../components/PageBackground';
import { useTranslation } from '../../hooks/TranslationProvider';

const SettingsPage: React.FC = () => {
  const { tSync } = useTranslation();
  // Profile info state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  // TODO: Fetch current user info and prefill fields

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileMessage(null);
    // TODO: Call API to update profile info
    setTimeout(() => {
      setProfileMessage(tSync('settingsPage_profile_updated'));
      setLoading(false);
    }, 1000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage(tSync('settingsPage_passwords_no_match'));
      return;
    }
    setLoading(true);
    // TODO: Call API to change password
    setTimeout(() => {
      setPwMessage(tSync('settingsPage_password_updated'));
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <PageBackground imageUrl="/edit_profile.png" />
      <PageWrapper>
        <div className="max-w-xl mx-auto mt-10 card p-8 flex flex-col gap-10">
          <h2 className="text-2xl font-bold mb-4">{tSync('settingsPage_title')}</h2>
          {/* Profile info form */}
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">{tSync('settingsPage_profile_section_title')}</h3>
            <label>
              {tSync('settingsPage_name_label')}
              <input className="input-dark w-full" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_email_label')}
              <input className="input-dark w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_phone_label')}
              <input className="input-dark w-full" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
            <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
              {tSync('settingsPage_save_button')}
            </button>
            {profileMessage && <div className="text-green-600 text-sm">{profileMessage}</div>}
          </form>
          {/* Password change form */}
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">{tSync('settingsPage_password_section_title')}</h3>
            <label>
              {tSync('settingsPage_current_password_label')}
              <input className="input-dark w-full" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_new_password_label')}
              <input className="input-dark w-full" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_confirm_password_label')}
              <input className="input-dark w-full" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </label>
            <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
              {tSync('settingsPage_change_password_button')}
            </button>
            {pwMessage && <div className="text-green-600 text-sm">{pwMessage}</div>}
          </form>
        </div>
      </PageWrapper>
    </>
  );
}

export default SettingsPage;
