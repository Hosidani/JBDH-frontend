const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { CheckboxGroup } from '../../components/ui/CheckboxGroup';
import { FileDropZone } from '../../components/ui/FileDropZone';
import { Heading } from '../../components/ui/Heading';

const availableRoles = [
  { value: 'Manager',   label: 'Säljare' },
  { value: 'Recruiter', label: 'Rekryterare' },
];

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { tSync, language } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Email', email);
      formData.append('Password', password);
      formData.append('ConfirmPassword', confirmPassword);
      formData.append('Location', location);
      formData.append('PreferredLanguage', language);
      formData.append('Open', open ? 'true' : 'false');
      selectedRoles.forEach(role => formData.append('SelectedRoles', role));
      if (cvFile) formData.append('CVFile', cvFile);

      const response = await fetch(`${API_URL}/Register/RegisterUser`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (response.ok) {
        navigate('/account');
      } else {
        let errorMsg = tSync('registerPage_failed');
        try {
          const data = await response.json();
          errorMsg = data.error || data.message || errorMsg;
        } catch {
          const text = await response.text();
          if (text) errorMsg = text;
        }
        setError(errorMsg);
      }
    } catch {
      setError(tSync('registerPage_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="text-center text-blue-600 mb-6">{tSync('registerPage_title')}</Heading>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-4">
          <TextInput label={tSync('registerPage_email_label')}            value={email}           onChange={setEmail}           type="email"    />
          <TextInput label={tSync('registerPage_password_label')}         value={password}        onChange={setPassword}        type="password" />
          <TextInput label={tSync('registerPage_confirm_password_label')} value={confirmPassword} onChange={setConfirmPassword} type="password" />
          <TextInput label={tSync('registerPage_location_label')}         value={location}        onChange={setLocation} />

          <FileDropZone
            accept=".pdf,.doc,.docx"
            label={tSync('registerPage_cv_file_label')}
            sublabel="PDF, DOC eller DOCX"
            onFile={file => setCvFile(file)}
          />

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input type="checkbox" checked={open} onChange={e => setOpen(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            {tSync('registerPage_open_to_opportunities_label')}
          </label>

          <CheckboxGroup
            label={tSync('registerPage_roles_label')}
            options={availableRoles}
            selected={selectedRoles}
            onChange={setSelectedRoles}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            {loading ? tSync('registerPage_registering') : tSync('registerPage_button')}
          </Button>
        </form>
      </SectionCard>
    </PageWrapper>
  );
};

export default RegisterPage;
