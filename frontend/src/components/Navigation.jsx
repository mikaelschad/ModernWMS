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
    const { currentFacility, facilities, selectFacility, loading } = useFacility();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, hasRole, hasPermission } = useAuth();
    const [showFacilityMenu, setShowFacilityMenu] = React.useState(false);
    const [facilitySearchTerm, setFacilitySearchTerm] = React.useState('');
    const facilityMenuRef = React.useRef(null);
    const searchInputRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (facilityMenuRef.current && !facilityMenuRef.current.contains(event.target)) {
                setShowFacilityMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        if (showFacilityMenu && facilities.length > 5 && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        if (!showFacilityMenu) {
            // Reset search when menu closes
            setTimeout(() => setFacilitySearchTerm(''), 200);
        }
    }, [showFacilityMenu, facilities.length]);

    const handleFacilitySelect = (facility) => {
        selectFacility(facility);
        setShowFacilityMenu(false);
    };

    const filteredFacilities = facilities.filter(f =>
        f.id.toLowerCase().includes(facilitySearchTerm.toLowerCase()) ||
        f.name.toLowerCase().includes(facilitySearchTerm.toLowerCase())
    );

    const isActive = (path) => location.pathname === path;
    const isMasterData = () => ['/items', '/itemgroups', '/customers', '/consignees', '/facilities', '/zones', '/sections', '/locations'].includes(location.pathname);

    return (
        <div className="nav-wrapper">
            <div className="nav-top-row">
                <div className="nav-left" ref={facilityMenuRef}>
                    <div
                        className="facility-status clickable"
                        onClick={() => !loading && setShowFacilityMenu(!showFacilityMenu)}
                    >
                        <span className="pulsating-dot"></span>
                        {currentFacility ? `${currentFacility.id} - Active` : 'Initializing...'}
                        <span className="dropdown-caret">▼</span>
                    </div>
                    {showFacilityMenu && (
                        <div className="facility-dropdown-menu">
                            {facilities.length > 5 && (
                                <div className="facility-search-container">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder={t('search_facility', 'Search...')}
                                        value={facilitySearchTerm}
                                        onChange={(e) => setFacilitySearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="facility-search-input"
                                    />
                                </div>
                            )}

                            {loading && <div className="facility-dropdown-item">Loading...</div>}
                            {!loading && filteredFacilities.length === 0 && <div className="facility-dropdown-item">No Results</div>}

                            {filteredFacilities.map(facility => (
                                <div
                                    key={facility.id}
                                    className={`facility-dropdown-item ${currentFacility?.id === facility.id ? 'active' : ''}`}
                                    onClick={() => handleFacilitySelect(facility)}
                                >
                                    🏢 {facility.id} - {facility.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="nav-right">
                    <div className="nav-divider"></div>
                    <ThemeSelector />
                    <LanguageSwitcher />
                    <div className="nav-item user-dropdown">
                        <button className="nav-btn user-btn">
                            {user?.username || 'User'} <span>▼</span>
                        </button>
                        <div className="dropdown-menu right-aligned">
                            <button className="dropdown-item" onClick={() => navigate('/change-password')}>
                                {t('change_password')}
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout-item" onClick={logout}>
                                {t('logout', 'Logout')}
                            </button>
                        </div>
                    </div>
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

                    {hasPermission('PLATE_READ') && (
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
                    )}

                    <div className="nav-item">
                        <button className={`nav-btn ${isMasterData() ? 'active' : ''}`}>
                            {t('master_data')} <span>▼</span>
                        </button>
                        <div className="dropdown-menu">
                            <div className="dropdown-header">{t('inventory')}</div>
                            {hasPermission('ITEM_READ') && <button className={`dropdown-item ${isActive('/items') ? 'active' : ''}`} onClick={() => navigate('/items')}>{t('items')}</button>}
                            {hasPermission('ITEMGROUP_READ') && <button className={`dropdown-item ${isActive('/itemgroups') ? 'active' : ''}`} onClick={() => navigate('/itemgroups')}>{t('item_groups')}</button>}

                            <div className="dropdown-divider"></div>
                            <div className="dropdown-header">{t('partners')}</div>
                            {hasPermission('CUSTOMER_READ') && <button className={`dropdown-item ${isActive('/customers') ? 'active' : ''}`} onClick={() => navigate('/customers')}>{t('customers')}</button>}
                            {hasPermission('CONSIGNEE_READ') && <button className={`dropdown-item ${isActive('/consignees') ? 'active' : ''}`} onClick={() => navigate('/consignees')}>{t('consignees')}</button>}

                            <div className="dropdown-divider"></div>
                            <div className="dropdown-header">{t('facility_config')}</div>
                            {hasPermission('FACILITY_READ') && <button className={`dropdown-item ${isActive('/facilities') ? 'active' : ''}`} onClick={() => navigate('/facilities')}>{t('facilities')}</button>}
                            {hasPermission('ZONE_READ') && <button className={`dropdown-item ${isActive('/zones') ? 'active' : ''}`} onClick={() => navigate('/zones')}>{t('zones')}</button>}
                            {hasPermission('SECTION_READ') && <button className={`dropdown-item ${isActive('/sections') ? 'active' : ''}`} onClick={() => navigate('/sections')}>{t('sections')}</button>}
                            {hasPermission('LOCATION_READ') && <button className={`dropdown-item ${isActive('/locations') ? 'active' : ''}`} onClick={() => navigate('/locations')}>{t('locations')}</button>}
                            {hasPermission('LOCATION_READ') && <button className={`dropdown-item ${isActive('/location-types') ? 'active' : ''}`} onClick={() => navigate('/location-types')}>{t('location_types')}</button>}
                        </div>
                    </div>

                    <button className={isActive('/settings') ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('/settings')}>
                        {t('settings')}
                    </button>
                    {hasPermission('USER_READ') && (
                        <button className={isActive('/users') ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('/users')}>
                            {t('users')}
                        </button>
                    )}
                    {hasPermission('ROLE_READ') && (
                        <button className={isActive('/roles') ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('/roles')}>
                            {t('roles')}
                        </button>
                    )}
                    {hasPermission('AUDIT_READ') && (
                        <button className={isActive('/audit') ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('/audit')}>
                            {t('audit_logs')}
                        </button>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navigation;
