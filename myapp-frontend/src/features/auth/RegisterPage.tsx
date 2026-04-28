const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { Heading } from '../../components/ui/Heading';
import { Modal } from '../../components/common/Modal';
import { isValidEmail } from '../../utils/validation';

const RegisterPage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailTakenModal, setEmailTakenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { tSync, language } = useTranslation();

  if (user) return <Navigate to="/account" replace />;

  const isFormValid =
    name.trim().replace(/\s/g, '').length >= 2 &&
    isValidEmail(email) &&
    password.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Name', name);
      formData.append('Email', email);
      formData.append('Phone', phone);
      formData.append('Password', password);
      formData.append('ConfirmPassword', confirmPassword);
      formData.append('Location', location);
      formData.append('PreferredLanguage', language);

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
          if (response.status === 400 && Array.isArray(data?.details?.email)) {
            setEmailTakenModal(true);
            return;
          }
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
    <>
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="text-center text-blue-600 mb-4">{tSync('registerPage_title')}</Heading>
        <p className="text-slate-600 text-sm mb-6">{tSync('registerPage_intro')}</p>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-4">
          <TextInput label={tSync('registerPage_name_label')}             value={name}            onChange={setName}            helpText={tSync('registerPage_required')} />
          <TextInput label={tSync('registerPage_email_label')}            value={email}           onChange={setEmail}           type="email"     helpText={tSync('registerPage_required')} />
          <TextInput label={tSync('registerPage_phone_label')}            value={phone}           onChange={setPhone}           type="tel"      />
          <TextInput label={tSync('registerPage_location_label')}         value={location}        onChange={setLocation} />
          <TextInput label={tSync('registerPage_password_label')}         value={password}        onChange={setPassword}        type="password" showToggle helpText={tSync('registerPage_required')} />
          <TextInput label={tSync('registerPage_confirm_password_label')} value={confirmPassword} onChange={setConfirmPassword} type="password" showToggle helpText={tSync('registerPage_required')} />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={loading} disabled={!isFormValid} className="self-center">
            {loading ? tSync('registerPage_registering') : tSync('registerPage_button')}
          </Button>
        </form>
      </SectionCard>
    </PageWrapper>

    <Modal open={emailTakenModal} onClose={() => setEmailTakenModal(false)} title={tSync('registerPage_email_taken_title')}>
      <p className="text-slate-700 text-sm mb-6">{tSync('registerPage_email_taken_message')}</p>
      <div className="flex justify-end">
        <Button variant="primary" size="lg" onClick={() => setEmailTakenModal(false)}>{tSync('button_ok')}</Button>
      </div>
    </Modal>
    </>
  );
};

export default RegisterPage;
