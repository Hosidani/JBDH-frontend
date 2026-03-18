import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { Heading } from '../../components/ui/Heading';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { tSync } = useTranslation();
  const successMessage = location.state?.success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await ApiService.loginUser(email, password);
    if (result.user) {
      login(result.user);
      navigate('/');
    } else {
      setError(tSync('loginPage_invalid_credentials'));
    }
    setLoading(false);
  };

  return (
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="text-center text-blue-600 mb-6">{tSync('loginPage_title')}</Heading>
        {successMessage && <p className="text-green-600 text-sm text-center mb-4">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextInput label={tSync('loginPage_email_label')}    value={email}    onChange={setEmail}    type="email"    />
          <TextInput label={tSync('loginPage_password_label')} value={password} onChange={setPassword} type="password" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            {loading ? tSync('loginPage_logging_in') : tSync('loginPage_button')}
          </Button>
        </form>
      </SectionCard>
    </PageWrapper>
  );
};

export default LoginPage;
