import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import './Auth.css';

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/profile';

  useEffect(() => {
    const handleCredentialResponse = async (response: any) => {
      setError('');
      setLoading(true);
      try {
        await loginWithGoogle(response.credential);
        navigate(from, { replace: true });
      } catch (err) {
        setError(lang === 'tj' ? 'Вуруд бо Google ноком шуд' : lang === 'ru' ? 'Вход через Google не удался' : 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    };

    const initGoogle = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "176459583485-1lpnthblnajp23sqicmhu933qck8mb46.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };

    let retries = 0;
    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(interval);
      } else {
        retries++;
        if (retries > 10) clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [loginWithGoogle, navigate, from, lang]);

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

        <div className="auth-divider">
          <span>{lang === 'tj' ? 'ё бо' : lang === 'ru' ? 'или через' : 'or login with'}</span>
        </div>

        <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>

        <p className="auth-switch">
          {t('noAccount')}
          <Link to="/signup">{t('signup')}</Link>
        </p>
      </div>
    </div>
  );
};
