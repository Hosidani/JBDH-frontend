import React, { useState } from 'react';
import { ApiService } from '../../services/ApiService';
import { PageWrapper, PageBackground } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import ProfileForm from '../../components/settings/ProfileForm';
import PasswordForm from '../../components/settings/PasswordForm';
import EmailConfirmModal from '../../components/settings/EmailConfirmModal';

const SettingsPage: React.FC = () => {
  const { tSync } = useTranslation();
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

  React.useEffect(() => {
    ApiService.getMyProfile()
      .then(profile => {
        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone_number || '');
        setOriginalEmail(profile.email || '');
      // setLocation(profile.location || '');
      // setDesiredEmploymentTypes(profile.desired_employment_types || []);
      // setDesiredWorkModes(profile.desired_work_modes || []);
      // setTravelAvailability(profile.travel_availability || '');
      // setAvailableFrom(profile.available_from || '');
      // setDesiredCity(profile.desired_city || '');
      // setWorkPlace(profile.work_place || '');
      // setCompetencies(profile.competencies || []);
      // setCvPath(profile.cv_path || '');
      // setDeveloperMode(profile.developer_mode || false);
      // setSearchable(profile.searchable || false);
      // setIsBanned(profile.is_banned || false);
      // setRole(profile.role || '');
      // setSelectedRoles(profile.selected_roles || []);
      // setOwnerId(profile.owner_id || null);
      // setAboutMe(profile.about_me || '');
      // setCreatedAt(profile.created_at || '');
      // setAiResponses(profile.ai_responses || []);
      // setOwnedUsers(profile.owned_users || []);
      // setOwner(profile.owner || null);
      })
      .catch(error => {
        setProfileMessage('Error loading profile data');
      });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    const dto = {
      Name: name,
      Email: email,
      PhoneNumber: phone
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
      if (dto.Email !== originalEmail) {
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
        </div>
      </PageWrapper>
    </>
  );
}

export default SettingsPage;
