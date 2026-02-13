import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useFacility } from '../contexts/FacilityContext';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from '../components/GlassCard';
import '../styles/master-data.css';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { currentFacility, facilities, setFacility } = useFacility();
    const { theme, setTheme } = useTheme();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <main className="main-content">
            <header className="page-header">
                <h1>{t('settings')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure your personalized WMS experience</p>
            </header>

            <div className="dashboard-grid">
                <GlassCard title="User Profile">
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Logged in as</label>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user?.username}</div>
                    </div>
                    <button onClick={logout} className="btn-delete" style={{ width: '100%' }}>Logout</button>
                </GlassCard>

                <GlassCard title="Interface Preferences">
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>{t('select_theme')}</label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: '100%', marginTop: '0.5rem' }}>
                            <option value="light">{t('light_mode')}</option>
                            <option value="dark">{t('dark_mode')}</option>
                            <option value="plexus">{t('plexus_theme')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Language</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={() => changeLanguage('en')}
                                className={i18n.language === 'en' ? 'btn-primary' : 'btn-secondary'}
                                style={{ flex: 1 }}
                            >
                                English
                            </button>
                            <button
                                onClick={() => changeLanguage('es')}
                                className={i18n.language === 'es' ? 'btn-primary' : 'btn-secondary'}
                                style={{ flex: 1 }}
                            >
                                Español
                            </button>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Operation Context">
                    <div className="form-group">
                        <label>{t('facility')}</label>
                        <select
                            value={currentFacility?.id || ''}
                            onChange={(e) => {
                                const fac = facilities.find(f => f.id === e.target.value);
                                if (fac) setFacility(fac);
                            }}
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            {facilities.map(f => (
                                <option key={f.id} value={f.id}>{f.id} - {f.name}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Changing the facility updates your active working context.
                        </p>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
};

export default Settings;
