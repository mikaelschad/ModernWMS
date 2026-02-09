import { useState, useEffect } from 'react'
import GlassCard from './components/GlassCard'
import OrderEntry from './components/OrderEntry'
import PlateLookup from './pages/PlateLookup'
import Facilities from './pages/Facilities'
import Customers from './pages/Customers'
import Items from './pages/Items'
import ItemGroups from './pages/ItemGroups'
import Zones from './pages/Zones'
import Sections from './pages/Sections'
import Locations from './pages/Locations'
import Consignees from './pages/Consignees'
import { FacilityProvider, useFacility } from './contexts/FacilityContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import ThemeSelector from './components/ThemeSelector'
import './App.css'

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inventory, setInventory] = useState([])
  const [forecast, setForecast] = useState(0)
  const { currentFacility, facilities, selectFacility } = useFacility()
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Simulation of API calls
  useEffect(() => {
    setInventory([
      { sku: 'ORA-999', quantity: 500, location: 'L-BASE-1', facilityId: 'FAC-ORA' },
      { sku: 'MOD-001', quantity: 10, location: 'M-01-A', facilityId: 'FAC-MOD' }
    ])
    setForecast(250.5)
  }, [])

  return (
    <div className="dashboard-container">
      <nav className="main-nav">
        <div className="brand">
          <img src={theme === 'light' ? "/logo.svg" : "/logo-color.png"} alt="ModernWMS" className="brand-logo" />
        </div>
        <div className="nav-links">
          <button className={activeTab === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('dashboard')}>
            {t('dashboard')}
          </button>

          <div className="nav-item">
            <button className={`nav-btn ${['lookup'].includes(activeTab) ? 'active' : ''}`}>
              {t('operations')} <span>▼</span>
            </button>
            <div className="dropdown-menu">
              <button className={`dropdown-item ${activeTab === 'lookup' ? 'active' : ''}`} onClick={() => setActiveTab('lookup')}>
                {t('plate_lookup')}
              </button>
            </div>
          </div>

          <div className="nav-item">
            <button className={`nav-btn ${['customers', 'items', 'itemgroups', 'zones', 'sections', 'locations', 'consignees', 'facilities'].includes(activeTab) ? 'active' : ''}`}>
              {t('master_data')} <span>▼</span>
            </button>
            <div className="dropdown-menu">
              <div className="dropdown-header">{t('inventory')}</div>
              <button className={`dropdown-item ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>{t('items')}</button>
              <button className={`dropdown-item ${activeTab === 'itemgroups' ? 'active' : ''}`} onClick={() => setActiveTab('itemgroups')}>{t('item_groups')}</button>

              <div className="dropdown-divider"></div>
              <div className="dropdown-header">{t('partners')}</div>
              <button className={`dropdown-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>{t('customers')}</button>
              <button className={`dropdown-item ${activeTab === 'consignees' ? 'active' : ''}`} onClick={() => setActiveTab('consignees')}>{t('consignees')}</button>

              <div className="dropdown-divider"></div>
              <div className="dropdown-header">{t('facility_config')}</div>
              <button className={`dropdown-item ${activeTab === 'facilities' ? 'active' : ''}`} onClick={() => setActiveTab('facilities')}>{t('facilities')}</button>
              <button className={`dropdown-item ${activeTab === 'zones' ? 'active' : ''}`} onClick={() => setActiveTab('zones')}>{t('zones')}</button>
              <button className={`dropdown-item ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>{t('sections')}</button>
              <button className={`dropdown-item ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>{t('locations')}</button>
            </div>
          </div>

          <button className={activeTab === 'settings' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('settings')}>
            {t('settings')}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        </div>
      </nav>

      {activeTab === 'lookup' && <PlateLookup />}
      {activeTab === 'facilities' && <Facilities />}
      {activeTab === 'customers' && <Customers />}
      {activeTab === 'items' && <Items />}
      {activeTab === 'itemgroups' && <ItemGroups />}
      {activeTab === 'zones' && <Zones />}
      {activeTab === 'sections' && <Sections />}
      {activeTab === 'locations' && <Locations />}
      {activeTab === 'consignees' && <Consignees />}

      {activeTab === 'dashboard' && (
        <main className="main-content">
          <header className="page-header">
            <h1>{t('dashboard')}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{t('real_time_ops_overview')}</p>
          </header>

          <div className="dashboard-grid">
            <GlassCard title={t('global_inventory')}>
              <div className="metric-value">{inventory.reduce((acc, item) => acc + item.quantity, 0)}</div>
              <div className="metric-label">{t('total_units_stock')}</div>
            </GlassCard>

            <GlassCard title={t('ai_demand_forecast')}>
              <div className="forecast-container">
                <div className="forecast-number">{forecast} units</div>
                <div className="metric-label">{t('predicted_sku_velocity')}</div>
              </div>
            </GlassCard>

            <GlassCard title={t('active_orders')}>
              <div className="metric-value">12</div>
              <div className="metric-label">{t('pending_receiving')}</div>
            </GlassCard>

            <OrderEntry />
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <GlassCard title={t('inventory_distribution')}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '0.75rem 0' }}>{t('sku')}</th>
                    <th>{t('location')}</th>
                    <th>{t('facility')}</th>
                    <th>{t('quantity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{item.sku}</td>
                      <td>{item.location}</td>
                      <td>{item.facilityId}</td>
                      <td style={{ color: '#fff' }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
        </main>
      )}
    </div>
  )
}

function App() {
  return (
    <FacilityProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </FacilityProvider>
  )
}

export default App
