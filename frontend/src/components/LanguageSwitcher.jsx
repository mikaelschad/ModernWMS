import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-switcher" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={() => changeLanguage('en')}
                style={{
                    fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
                    opacity: i18n.language === 'en' ? 1 : 0.7,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer'
                }}
            >
                EN
            </button>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <button
                onClick={() => changeLanguage('es')}
                style={{
                    fontWeight: i18n.language === 'es' ? 'bold' : 'normal',
                    opacity: i18n.language === 'es' ? 1 : 0.7,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer'
                }}
            >
                ES
            </button>
        </div>
    );
};

export default LanguageSwitcher;
