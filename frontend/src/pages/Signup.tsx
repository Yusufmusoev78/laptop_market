import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { checkUsername } from '../api/auth';
import './Auth.css';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (username.trim().length < 3) {
      setUsernameStatus('idle');
      setUsernameSuggestions([]);
      return;
    }
    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsername(username.trim());
        setUsernameStatus(result.available ? 'available' : 'taken');
        setUsernameSuggestions(result.suggestions);
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      await signup({ email, username, phone, address, password, role });
      navigate('/profile', { replace: true });
    } catch {
      setError(t('signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{t('createAccount')}</h1>
        <p className="auth-subtitle">{t('signupToStart')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600 }}>{lang === 'tj' ? 'Нақши шумо' : lang === 'ru' ? 'Ваша роль' : 'Your Role'}</label>
            <div className="auth-role-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className={`auth-role-tab ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => setRole('buyer')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: role === 'buyer' ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                  background: role === 'buyer' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  color: role === 'buyer' ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                🛒 {lang === 'tj' ? 'Харидор (Маркет)' : lang === 'ru' ? 'Покупатель (Маркет)' : 'Buyer (Market)'}
              </button>
              <button
                type="button"
                className={`auth-role-tab ${role === 'usto' ? 'active' : ''}`}
                onClick={() => setRole('usto')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: role === 'usto' ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                  background: role === 'usto' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  color: role === 'usto' ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                🛠️ {lang === 'tj' ? 'Усто (Таъмиркор)' : lang === 'ru' ? 'Мастер (Усто)' : 'Master (Usto)'}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">{t('emailLabel')}</label>
            <input
              id="signup-email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-username">{t('usernameLabel')}</label>
            <input
              id="signup-username" required minLength={3} autoComplete="username"
              value={username} onChange={e => setUsername(e.target.value)}
            />
            {usernameStatus === 'checking' && <span className="username-hint">{t('checkingUsername')}</span>}
            {usernameStatus === 'available' && <span className="username-hint username-ok">{t('usernameAvailable')}</span>}
            {usernameStatus === 'taken' && (
              <div className="username-hint username-bad">
                <span>{t('usernameTaken')}</span>
                <div className="username-suggestions">
                  {usernameSuggestions.map(s => (
                    <button key={s} type="button" className="username-suggestion-chip" onClick={() => setUsername(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-phone">{t('phoneLabel')}</label>
            <input
              id="signup-phone" type="tel" required autoComplete="tel"
              value={phone} onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-address">{t('addressLabel')}</label>
            <input
              id="signup-address" required autoComplete="street-address"
              value={address} onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">{t('passwordLabel')}</label>
            <input
              id="signup-password" type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-confirm">{t('confirmPasswordLabel')}</label>
            <input
              id="signup-confirm" type="password" required minLength={8} autoComplete="new-password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="auth-submit-btn" isLoading={loading}>
            {t('signup')}
          </Button>
        </form>

        <p className="auth-switch">
          {t('haveAccount')}
          <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
};
