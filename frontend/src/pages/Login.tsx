import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import './Auth.css';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{t('welcomeBack')}</h1>
        <p className="auth-subtitle">{t('loginToContinue')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="login-email">{t('emailLabel')}</label>
            <input
              id="login-email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">{t('passwordLabel')}</label>
            <input
              id="login-password" type="password" required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="auth-submit-btn" isLoading={loading}>
            {t('login')}
          </Button>
        </form>

        <p className="auth-switch">
          {t('noAccount')}
          <Link to="/signup">{t('signup')}</Link>
        </p>
      </div>
    </div>
  );
};
