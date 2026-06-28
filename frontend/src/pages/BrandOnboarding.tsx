import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { createBrand, BrandCreateInput } from '../api/brands';
import './Auth.css';

const emptyForm: BrandCreateInput = { name: '', contact_phone: '', support_email: '', description: '' };

export const BrandOnboarding: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState<BrandCreateInput>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof BrandCreateInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createBrand(form);
      navigate('/profile', { replace: true });
    } catch {
      setError(t('brandRegisterFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{t('brandOnboardingTitle')}</h1>
        <p className="auth-subtitle">{t('brandOnboardingDesc')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="brand-name">{t('brandName')}</label>
            <input id="brand-name" required value={form.name} onChange={handleChange('name')} />
          </div>

          <div className="auth-field">
            <label htmlFor="brand-phone">{t('contactPhoneLabel')}</label>
            <input id="brand-phone" type="tel" required value={form.contact_phone} onChange={handleChange('contact_phone')} />
          </div>

          <div className="auth-field">
            <label htmlFor="brand-email">{t('supportEmailLabel')}</label>
            <input id="brand-email" type="email" required value={form.support_email} onChange={handleChange('support_email')} />
          </div>

          <div className="auth-field">
            <label htmlFor="brand-desc">{t('brandDescriptionLabel')}</label>
            <textarea id="brand-desc" value={form.description} onChange={handleChange('description')} />
          </div>

          <Button type="submit" className="auth-submit-btn" isLoading={loading}>
            {t('submitBrand')}
          </Button>
        </form>
      </div>
    </div>
  );
};
