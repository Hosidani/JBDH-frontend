const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';

const availableRoles = ["Manager", "Recruiter"];

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { tSync } = useTranslation();

  const handleRoleChange = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    } else {
      setCvFile(null);
    }
  };

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
      formData.append('Open', open ? 'true' : 'false');
      selectedRoles.forEach(role => formData.append('SelectedRoles', role));
      if (cvFile) formData.append('CVFile', cvFile);

      // Debug: log all FormData keys and values
      for (let [key, value] of (formData as any).entries()) {
        console.log('FormData:', key, value);
      }

      const response = await fetch(`${API_URL}/Register/RegisterUser`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (response.ok) {
        // Redirect to login page with success message
        navigate('/login', { state: { success: tSync('registerPage_success') } });
      } else {
        // Try to parse error as JSON, fallback to text
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
    } catch (err) {
      setError(tSync('registerPage_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2 style={{ color: '#2563eb', textAlign: 'center' }}>{tSync('registerPage_title')}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ marginBottom: '1rem' }}>
            <label>{tSync('registerPage_email_label')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>{tSync('registerPage_password_label')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>{tSync('registerPage_confirm_password_label')}</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>{tSync('registerPage_location_label')}</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>{tSync('registerPage_cv_file_label')}</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              <input type="checkbox" checked={open} onChange={e => setOpen(e.target.checked)} /> {tSync('registerPage_open_to_opportunities_label')}
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>{tSync('registerPage_roles_label')}</label>
            <div>
              {availableRoles.map(role => (
                <label key={role} style={{ marginRight: 12 }}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    style={{ accentColor: '#2563eb' }}
                  />{' '}
                  {role}
                </label>
              ))}
            </div>
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: 'white', padding: 10, borderRadius: 4, fontWeight: 600 }}>
            {loading ? tSync('registerPage_registering') : tSync('registerPage_button')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
