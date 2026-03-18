import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/ApiService';
import { PageWrapper, PageBackground } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import ProfileForm from '../../components/settings/ProfileForm';
import PasswordForm from '../../components/settings/PasswordForm';
import EmailConfirmModal from '../../components/settings/EmailConfirmModal';

const SettingsPage: React.FC = () => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [pendingDto, setPendingDto] = useState<any | null>(null);
  const [originalEmail, setOriginalEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  // TODO: Fetch current user info and prefill fields
  React.useEffect(() => {
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
        if (error?.message?.includes('401')) { navigate('/login'); return; }
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
      if (error?.message?.includes('401')) { navigate('/login'); return; }
      setProfileMessage(error?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowEmailConfirm(false);
    if (pendingDto) await submitProfileUpdate(pendingDto);
    setPendingDto(null);
  };

  const handleEmailCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowEmailConfirm(false);
    setPendingDto(null);
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
      if (error?.message?.includes('401')) { navigate('/login'); return; }
      setPwMessage(error?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBackground imageUrl="/edit_profile.png" opacity={1} blur={0} />
      <PageWrapper className="card p-8 flex flex-col gap-10 relative z-10">
          <h2 className="text-2xl font-bold mb-4">{tSync('settingsPage_title')}</h2>
          <ProfileForm
            name={name}
            email={email}
            phone={phone}
            loading={loading}
            message={profileMessage}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onSubmit={handleProfileSubmit}
            tSync={tSync}
          />
          <EmailConfirmModal
            isOpen={showEmailConfirm}
            newEmail={email}
            onConfirm={handleEmailConfirm}
            onCancel={handleEmailCancel}
          />
          <PasswordForm
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            loading={loading}
            message={pwMessage}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handlePasswordSubmit}
            tSync={tSync}
          />
      </PageWrapper>
    </>
  );
}

export default SettingsPage;
