import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import GlassCard from './GlassCard';
import API_BASE_URL from '../config/api';
import '../pages/PlateLookup.css';

const HistoryModal = ({ type, id, onClose }) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const encodedId = encodeURIComponent(id);
                // type is 'plate' or 'item'
                const controller = type === 'plate' ? 'LicensePlate' : 'Item';
                const endpoint = `${API_BASE_URL}/api/${controller}/${encodedId}/history`;

                const res = await axios.get(endpoint);
                setHistory(res.data);
            } catch (err) {
                setError(err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHistory();
    }, [type, id]);

    return (
        <div className="modal-overlay">
            <div className="modal-content large" style={{ maxWidth: '900px', width: '95%' }}>
                <GlassCard title={`${t('history')} - ${id}`}>
                    <div className="history-content">
                        {loading && <div className="loading">{t('loading')}...</div>}
                        {error && <div className="error-message">⚠ {error}</div>}

                        {!loading && history.length === 0 && (
                            <div className="no-data">{t('no_history_found', 'No history records found for this entity.')}</div>
                        )}

                        {!loading && history.length > 0 && (
                            <div className="master-table scrollable" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{t('date')}</th>
                                            <th>{t('action')}</th>
                                            <th>{t('user')}</th>
                                            {type === 'plate' ? (
                                                <>
                                                    <th>{t('location')}</th>
                                                    <th>{t('quantity')}</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th>{t('sku')}</th>
                                                    <th>{t('description')}</th>
                                                </>
                                            )}
                                            <th>{t('status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((h, i) => (
                                            <tr key={i}>
                                                <td>{new Date(h.actionDate).toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge-small ${(h.action || '').toUpperCase() === 'INSERT' ? 'active' : (h.action || '').toUpperCase() === 'DELETE' ? 'inactive' : 'hold'}`}>
                                                        {h.action}
                                                    </span>
                                                </td>
                                                <td>{h.actionBy}</td>
                                                {type === 'plate' ? (
                                                    <>
                                                        <td>{h.location || h.LOCATION}</td>
                                                        <td>{h.quantity || h.QUANTITY}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{h.sku || h.SKU}</td>
                                                        <td>{h.description || h.DESCRIPTION}</td>
                                                    </>
                                                )}
                                                <td>{h.status || h.STATUS}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="cancel-btn" onClick={onClose}>{t('close')}</button>
                        </div>
                    </div>
                </GlassCard>
            </div>
            <style jsx>{`
                .master-table.scrollable table { width: 100%; border-collapse: collapse; }
                .master-table.scrollable th { position: sticky; top: 0; background: var(--glass-bg); backdrop-filter: blur(10px); z-index: 1; }
                .status-badge-small { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .status-badge-small.active { background: rgba(0, 255, 127, 0.15); color: #00ff7f; }
                .status-badge-small.inactive { background: rgba(255, 99, 132, 0.15); color: #ff6384; }
                .status-badge-small.hold { background: rgba(255, 205, 86, 0.15); color: #ffcd56; }
            `}</style>
        </div>
    );
};

export default HistoryModal;
