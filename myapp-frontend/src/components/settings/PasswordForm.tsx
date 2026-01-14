import React from 'react';

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
  currentPassword,
  newPassword,
  confirmPassword,
  loading,
  message,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  tSync,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h3 className="font-semibold text-lg">{tSync('settingsPage_password_section_title')}</h3>
      <label>
        {tSync('settingsPage_current_password_label')}
        <input
          className="w-full"
          type="password"
          value={currentPassword}
          onChange={e => onCurrentPasswordChange(e.target.value)}
        />
      </label>
      <label>
        {tSync('settingsPage_new_password_label')}
        <input
          className="w-full"
          type="password"
          value={newPassword}
          onChange={e => onNewPasswordChange(e.target.value)}
        />
      </label>
      <label>
        {tSync('settingsPage_confirm_password_label')}
        <input
          className="w-full"
          type="password"
          value={confirmPassword}
          onChange={e => onConfirmPasswordChange(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {tSync('settingsPage_change_password_button')}
      </button>
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </form>
  );
};

export default PasswordForm;
