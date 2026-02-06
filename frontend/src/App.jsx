import { useState, useEffect } from 'react'
import GlassCard from './components/GlassCard'
import OrderEntry from './components/OrderEntry'
import './App.css'

function App() {
  const [inventory, setInventory] = useState([])
  const [forecast, setForecast] = useState(0)

  // Simulation of API calls (connected to our backend in theory)
  useEffect(() => {
    // Mocking the backend response defined in InventoryController
    setInventory([
      { sku: 'ORA-999', quantity: 500, location: 'L-BASE-1', facilityId: 'FAC-ORA' },
      { sku: 'MOD-001', quantity: 10, location: 'M-01-A', facilityId: 'FAC-MOD' }
    ])
    setForecast(250.5)
  }, [])

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ModernWMS</h1>
        <p style={{ color: 'var(--text-muted)' }}>Warehouse Intelligence & AI Operations</p>
      </header>

      <div className="grid-layout">
        <GlassCard title="Global Inventory">
          <div className="metric-value">{inventory.reduce((acc, item) => acc + item.quantity, 0)}</div>
          <div className="metric-label">Total Units in Stock</div>
          <div style={{ marginTop: '1rem' }}>
            <span className="status-badge">Live Sync Active</span>
          </div>
        </GlassCard>

        <GlassCard title="AI Demand Forecast">
          <div className="metric-value">{forecast}</div>
          <div className="metric-label">Predicted SKU Velocity (Next 24h)</div>
          <div style={{ marginTop: '1rem', color: '#a855f7' }}>
            ↑ 12% vs. Last Week
          </div>
        </GlassCard>

        <GlassCard title="Active Inbound Orders">
          <div className="metric-value">12</div>
          <div className="metric-label">Orders Pending Receiving</div>
          <div style={{ marginTop: '1rem' }}>
            <button className="status-badge" style={{ cursor: 'pointer', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              View Queue
            </button>
          </div>
        </GlassCard>

        <OrderEntry />
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <GlassCard title="Inventory Distribution (Sample Data)">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.75rem 0' }}>SKU</th>
                <th>Location</th>
                <th>Facility</th>
                <th>Quantity</th>
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
    </div>
  )
}

export default App
