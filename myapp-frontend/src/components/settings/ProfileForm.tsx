import React from 'react';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';

interface ProfileFormProps {
  name: string;
  email: string;
  phone: string;
  loading: boolean;
  message: string | null;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  tSync: (key: string) => string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  name, email, phone, loading, message,
  onNameChange, onEmailChange, onPhoneChange, onSubmit, tSync,
}) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-4">
    <Heading level={3}>{tSync('settingsPage_profile_section_title')}</Heading>
    <TextInput label={tSync('settingsPage_name_label')}  value={name}  onChange={onNameChange}  type="text" />
    <TextInput label={tSync('settingsPage_email_label')} value={email} onChange={onEmailChange} type="email" />
    <TextInput label={tSync('settingsPage_phone_label')} value={phone} onChange={onPhoneChange} type="tel" />
    <Button type="submit" variant="primary" loading={loading}>
      {tSync('settingsPage_save_button')}
    </Button>
    {message && <p className="text-green-600 text-sm">{message}</p>}
  </form>
);

export default ProfileForm;
