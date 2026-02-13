import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import GlassCard from '../components/GlassCard';
import './PlateLookup.css'; // Reusing common styles

const AuditLog = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        tableName: '',
        action: '',
        recordId: ''
    });
    const [expandedLogId, setExpandedLogId] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_ENDPOINTS.AUDIT_LOGS);
            setLogs(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch audit logs", err);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredLogs = logs.filter(log => {
        return (
            (filters.tableName === '' || log.tableName.toLowerCase().includes(filters.tableName.toLowerCase())) &&
            (filters.action === '' || log.action.toLowerCase().includes(filters.action.toLowerCase())) &&
            (filters.recordId === '' || log.recordId.toLowerCase().includes(filters.recordId.toLowerCase()))
        );
    });

    const toggleExpand = (id) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const renderJsonDiff = (oldVal, newVal) => {
        try {
            const oldObj = oldVal ? JSON.parse(oldVal) : null;
            const newObj = newVal ? JSON.parse(newVal) : null;

            return (
                <div className="json-diff-container">
                    {oldObj && (
                        <div className="diff-box old">
                            <h4>{t('old_values', 'Old Values')}</h4>
                            <pre>{JSON.stringify(oldObj, null, 2)}</pre>
                        </div>
                    )}
                    {newObj && (
                        <div className="diff-box new">
                            <h4>{t('new_values', 'New Values')}</h4>
                            <pre>{JSON.stringify(newObj, null, 2)}</pre>
                        </div>
                    )}
                </div>
            );
        } catch (e) {
            return (
                <div className="json-diff-container">
                    {oldVal && <div className="diff-box old"><h4>Old</h4><pre>{oldVal}</pre></div>}
                    {newVal && <div className="diff-box new"><h4>New</h4><pre>{newVal}</pre></div>}
                </div>
            );
        }
    };

    return (
        <div className="plate-lookup-container audit-log-container">
            <header className="page-header">
                <h2>{t('audit_logs', 'Audit Logs')}</h2>
                <p>{t('audit_logs_desc', 'Track system changes and security events')}</p>
            </header>

            <GlassCard title={t('filters', 'Filters')}>
                <div className="lookup-filters">
                    <div className="filter-item">
                        <label>{t('table_name', 'Table Name')}</label>
                        <input
                            type="text"
                            name="tableName"
                            placeholder={t('table_name', 'Table Name')}
                            className="glass-input"
                            value={filters.tableName}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-item">
                        <label>{t('action', 'Action')}</label>
                        <input
                            type="text"
                            name="action"
                            placeholder={t('action', 'Action')}
                            className="glass-input"
                            value={filters.action}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-item">
                        <label>{t('record_id', 'Record ID')}</label>
                        <input
                            type="text"
                            name="recordId"
                            placeholder={t('record_id', 'Record ID')}
                            className="glass-input"
                            value={filters.recordId}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <button className="lookup-button" onClick={fetchLogs}>{t('refresh', 'Refresh')}</button>
                </div>
            </GlassCard>

            <div className="glass-card mt-4">
                <div className="lookup-results">
                    {loading ? (
                        <div className="loading">{t('loading', 'Loading...')}</div>
                    ) : (
                        <table className="lookup-table">
                            <thead>
                                <tr>
                                    <th>{t('date', 'Date')}</th>
                                    <th>{t('user', 'User')}</th>
                                    <th>{t('table', 'Table')}</th>
                                    <th>{t('record', 'Record')}</th>
                                    <th>{t('action', 'Action')}</th>
                                    <th>{t('details', 'Details')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <React.Fragment key={log.id}>
                                            <tr onClick={() => toggleExpand(log.id)} className="clickable-row">
                                                <td>{formatDate(log.changedDate)}</td>
                                                <td>{log.changedBy}</td>
                                                <td><span className="badge">{log.tableName}</span></td>
                                                <td>{log.recordId}</td>
                                                <td>
                                                    <span className={`status-badge-small ${log.action === 'INSERT' ? 'active' : log.action === 'DELETE' ? 'inactive' : 'hold'}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td>{expandedLogId === log.id ? '🔼' : '🔽'}</td>
                                            </tr>
                                            {expandedLogId === log.id && (
                                                <tr className="expanded-row">
                                                    <td colSpan="6">
                                                        {renderJsonDiff(log.oldValues, log.newValues)}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">{t('no_logs_found', 'No audit logs found')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style jsx>{`
                .clickable-row { cursor: pointer; }
                .clickable-row:hover { background: rgba(255, 255, 255, 0.1); }
                .expanded-row { background: rgba(0, 0, 0, 0.2); }
                .json-diff-container { display: flex; gap: 20px; padding: 15px; overflow-x: auto; }
                .diff-box { flex: 1; min-width: 300px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.1); }
                .diff-box h4 { margin-top: 0; font-size: 0.9rem; opacity: 0.7; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 5px; }
                .diff-box pre { font-size: 0.8rem; color: #ccf; white-space: pre-wrap; word-break: break-all; }
                .diff-box.old { border-left: 4px solid #f44; }
                .diff-box.new { border-left: 4px solid #4f4; }
                .badge { background: rgba(255, 255, 255, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
                .mt-4 { margin-top: 1.5rem; }
                .filter-item { display: flex; flex-direction: column; gap: 5px; }
                .filter-item label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin-left: 2px; }
            `}</style>
        </div>
    );
};

export default AuditLog;
