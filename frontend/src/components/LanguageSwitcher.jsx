// LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './NavDropdowns.css';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-switcher">
            <select
                value={i18n.language.split('-')[0]}
                onChange={(e) => changeLanguage(e.target.value)}
                className="nav-dropdown"
            >
                <option value="en">🇺🇸 {t('english')}</option>
                <option value="es">🇪🇸 {t('spanish')}</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;
