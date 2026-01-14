import React from 'react';

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
  name,
  email,
  phone,
  loading,
  message,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onSubmit,
  tSync,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h3 className="font-semibold text-lg">{tSync('settingsPage_profile_section_title')}</h3>
      <label>
        {tSync('settingsPage_name_label')}
        <span className="text-sm text-gray-500 ml-2">
          ({tSync('settingsPage_current_label')} {name || tSync('settingsPage_not_set')})
        </span>
        <input className="w-full" value={name} onChange={e => onNameChange(e.target.value)} />
      </label>
      <label>
        {tSync('settingsPage_email_label')}
        <span className="text-sm text-gray-500 ml-2">
          ({tSync('settingsPage_current_label')} {email || tSync('settingsPage_not_set')})
        </span>
        <input className="w-full" type="email" value={email} onChange={e => onEmailChange(e.target.value)} />
      </label>
      <label>
        {tSync('settingsPage_phone_label')}
        <span className="text-sm text-gray-500 ml-2">
          ({tSync('settingsPage_current_label')} {phone || tSync('settingsPage_not_set')})
        </span>
        <input className="w-full" value={phone} onChange={e => onPhoneChange(e.target.value)} />
      </label>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {tSync('settingsPage_save_button')}
      </button>
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </form>
  );
};

export default ProfileForm;
