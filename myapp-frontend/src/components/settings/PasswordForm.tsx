import React from 'react';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';

interface PasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  message: string | null;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  tSync: (key: string) => string;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  currentPassword, newPassword, confirmPassword, loading, message,
  onCurrentPasswordChange, onNewPasswordChange, onConfirmPasswordChange, onSubmit, tSync,
}) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-4">
    <Heading level={3}>{tSync('settingsPage_password_section_title')}</Heading>
    <TextInput label={tSync('settingsPage_current_password_label')} value={currentPassword} onChange={onCurrentPasswordChange} type="password" />
    <TextInput label={tSync('settingsPage_new_password_label')}     value={newPassword}     onChange={onNewPasswordChange}     type="password" />
    <TextInput label={tSync('settingsPage_confirm_password_label')} value={confirmPassword} onChange={onConfirmPasswordChange} type="password" />
    <Button type="submit" variant="primary" loading={loading}>
      {tSync('settingsPage_change_password_button')}
    </Button>
    {message && <p className="text-green-600 text-sm">{message}</p>}
  </form>
);

export default PasswordForm;
