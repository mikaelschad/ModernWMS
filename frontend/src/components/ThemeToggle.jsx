import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text)',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
            }}
            title={theme === 'light' ? t('dark_mode') : t('light_mode')}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;
