import React, { useState } from 'react';
import Modal from 'react-modal';
import { ApiService } from '../../services/ApiService';

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
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [pendingDto, setPendingDto] = useState<any | null>(null);
  const [originalEmail, setOriginalEmail] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  // TODO: Fetch current user info and prefill fields
  React.useEffect(() => {
    // Fetch current user info and prefill fields
    ApiService.getMyProfile()
      .then(profile => {
        console.log('Profile data received:', profile);
        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phoneNumber || '');
        setOriginalEmail(profile.email || '');
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setProfileMessage('Error loading profile data');
      });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    // Prepare DTO for API
    const dto = {
      Name: name,
      Email: email,
      PhoneNumber: phone
      // Add other fields as needed
    };
    if (email !== originalEmail) {
      setPendingDto(dto);
      setShowEmailConfirm(true);
      return;
    }
    await submitProfileUpdate(dto);
  };

  const submitProfileUpdate = async (dto: any) => {
    setLoading(true);
    try {
      await ApiService.updateUserSettings(dto);
      // If email was changed, log out and redirect to login
      if (dto.Email !== originalEmail) {
        // Optionally, call a logout API if needed
        window.location.href = '/login';
        return;
      }
      setProfileMessage(tSync('settingsPage_profile_updated'));
      window.location.href = '/profile';
    } catch (error: any) {
      setProfileMessage(error?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage(tSync('settingsPage_passwords_no_match'));
      return;
    }
    setLoading(true);
    try {
      await ApiService.changePassword(currentPassword, newPassword, confirmPassword);
      setPwMessage(tSync('settingsPage_password_updated'));
      // Clear password fields after successful change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPwMessage(error?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBackground imageUrl="/edit_profile.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="max-w-xl mx-auto mt-10 card p-8 flex flex-col gap-10 relative z-10">
          <h2 className="text-2xl font-bold mb-4">{tSync('settingsPage_title')}</h2>
          {/* Profile info form */}
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">{tSync('settingsPage_profile_section_title')}</h3>
            <label>
              {tSync('settingsPage_name_label')}
              <span className="text-sm text-gray-500 ml-2">({tSync('settingsPage_current_label')} {name || tSync('settingsPage_not_set')})</span>
              <input className="w-full" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_email_label')}
              <span className="text-sm text-gray-500 ml-2">({tSync('settingsPage_current_label')} {email || tSync('settingsPage_not_set')})</span>
              <input className="w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_phone_label')}
              <span className="text-sm text-gray-500 ml-2">({tSync('settingsPage_current_label')} {phone || tSync('settingsPage_not_set')})</span>
              <input className="w-full" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
            <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
              {tSync('settingsPage_save_button')}
            </button>
            {profileMessage && <div className="text-green-600 text-sm">{profileMessage}</div>}
          </form>
          {/* Email change confirmation modal */}
          <Modal
            isOpen={showEmailConfirm}
            onRequestClose={() => setShowEmailConfirm(false)}
            contentLabel="Email Change Confirmation"
            ariaHideApp={false}
            style={{
              overlay: {
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              content: {
                zIndex: 1001,
                position: 'relative',
                maxWidth: 400,
                margin: 'auto',
                padding: 24,
                inset: 'unset',
                borderRadius: 12,
                boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
              },
            }}
          >
            <h3 className="font-semibold mb-2">Confirm Email Change</h3>
            <p>Are you sure your new email is: <span className="font-bold">{email}</span>?</p>
            <p className="mt-2 text-sm text-red-600">You can't log in with the old one anymore.</p>
            <div className="flex gap-4 mt-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                onClick={async (e) => {
                  e.preventDefault();
                  setShowEmailConfirm(false);
                  if (pendingDto) await submitProfileUpdate(pendingDto);
                  setPendingDto(null);
                }}
              >Confirm</button>
              <button
                className="bg-gray-300 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                onClick={(e) => {
                  e.preventDefault();
                  setShowEmailConfirm(false);
                  setPendingDto(null);
                }}
              >Cancel</button>
            </div>
          </Modal>
          {/* Password change form */}
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">{tSync('settingsPage_password_section_title')}</h3>
            <label>
              {tSync('settingsPage_current_password_label')}
              <input className="w-full" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_new_password_label')}
              <input className="w-full" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </label>
            <label>
              {tSync('settingsPage_confirm_password_label')}
              <input className="w-full" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
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
