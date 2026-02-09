import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFacility } from '../contexts/FacilityContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSelector from './ThemeSelector';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { t } = useTranslation();
    const { currentFacility, facilities, selectFacility } = useFacility();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;
    const isMasterData = () => ['/items', '/itemgroups', '/customers', '/consignees', '/facilities', '/zones', '/sections', '/locations'].includes(location.pathname);

    return (
        <div className="nav-wrapper">
            <div className="nav-top-row">
                <div className="nav-right">
                    <div className="facility-selector">
                        <select
                            value={currentFacility?.id || ''}
                            onChange={(e) => {
                                const selected = facilities.find(f => f.id === e.target.value)
                                selectFacility(selected)
                            }}
                            className="facility-dropdown"
                        >
                            {facilities.map(facility => (
                                <option key={facility.id} value={facility.id}>
                                    {facility.id} - {facility.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <ThemeSelector />
                    <LanguageSwitcher />
                    <button onClick={logout} className="nav-btn logout-btn">
                        {t('logout', 'Logout')}
                    </button>
                </div>
            </div>

            <nav className="main-nav">
                <div className="brand">
                    <img src={theme === 'light' ? "/logo.svg" : "/logo-color.png"} alt="ModernWMS" className="brand-logo" />
                </div>
                <div className="nav-links">
                    <button className={isActive('/') ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('/')}>
                        {t('dashboard')}
                    </button>

                    <div className="nav-item">
                        <button className={`nav-btn ${location.pathname === '/lookup' ? 'active' : ''}`}>
                            {t('operations')} <span>▼</span>
                        </button>
                        <div className="dropdown-menu">
                            <button className={`dropdown-item ${isActive('/lookup') ? 'active' : ''}`} onClick={() => navigate('/lookup')}>
                                {t('plate_lookup')}
                            </button>
                        </div>
                    </div>

                    <div className="nav-item">
                        <button className={`nav-btn ${isMasterData() ? 'active' : ''}`}>
                            {t('master_data')} <span>▼</span>
                        </button>
                        <div className="dropdown-menu">
                            <div className="dropdown-header">{t('inventory')}</div>
                            <button className={`dropdown-item ${isActive('/items') ? 'active' : ''}`} onClick={() => navigate('/items')}>{t('items')}</button>
                            <button className={`dropdown-item ${isActive('/itemgroups') ? 'active' : ''}`} onClick={() => navigate('/itemgroups')}>{t('item_groups')}</button>

                            <div className="dropdown-divider"></div>
                            <div className="dropdown-header">{t('partners')}</div>
                            <button className={`dropdown-item ${isActive('/customers') ? 'active' : ''}`} onClick={() => navigate('/customers')}>{t('customers')}</button>
                            <button className={`dropdown-item ${isActive('/consignees') ? 'active' : ''}`} onClick={() => navigate('/consignees')}>{t('consignees')}</button>

                            <div className="dropdown-divider"></div>
                            <div className="dropdown-header">{t('facility_config')}</div>
                            <button className={`dropdown-item ${isActive('/facilities') ? 'active' : ''}`} onClick={() => navigate('/facilities')}>{t('facilities')}</button>
                            <button className={`dropdown-item ${isActive('/zones') ? 'active' : ''}`} onClick={() => navigate('/zones')}>{t('zones')}</button>
                            <button className={`dropdown-item ${isActive('/sections') ? 'active' : ''}`} onClick={() => navigate('/sections')}>{t('sections')}</button>
                            <button className={`dropdown-item ${isActive('/locations') ? 'active' : ''}`} onClick={() => navigate('/locations')}>{t('locations')}</button>
                        </div>
                    </div>

                    <button className={isActive('/settings') ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('/settings')}>
                        {t('settings')}
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navigation;
