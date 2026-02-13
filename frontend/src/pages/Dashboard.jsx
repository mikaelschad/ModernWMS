import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/GlassCard';
import OrderEntry from '../components/OrderEntry';

const Dashboard = () => {
    const { t } = useTranslation();
    const [inventory, setInventory] = useState([]);
    const [forecast, setForecast] = useState(0);

    useEffect(() => {
        setInventory([
            { sku: 'ORA-999', quantity: 500, location: 'L-BASE-1', facilityId: 'FAC-ORA' },
            { sku: 'MOD-001', quantity: 10, location: 'M-01-A', facilityId: 'FAC-MOD' }
        ])
        setForecast(250.5)
    }, [])

    return (
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
                                    <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            </div>
        </main>
    );
};

export default Dashboard;
