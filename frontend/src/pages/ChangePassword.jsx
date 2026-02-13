import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useToast } from '../contexts/ToastContext';

const ChangePassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch password policy if available via API, or hardcode/configured
        // For now, we'll implement client-side checks matching server
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            error(t('passwords_do_not_match'));
            return;
        }

        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            success(t('password_changed_successfully'));
            navigate('/');
        } catch (err) {
            error(err.response?.data?.message || t('error_changing_password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="glass-panel">
                <div className="panel-header">
                    <h2>{t('change_password')}</h2>
                </div>
                <div className="panel-content">
                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="form-group">
                            <label>{t('current_password')}</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                className="glass-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('new_password')}</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="glass-input"
                                maxLength={100}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('confirm_password')}</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="glass-input"
                                maxLength={100}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="glass-button secondary" onClick={() => navigate(-1)}>
                                {t('cancel')}
                            </button>
                            <button type="submit" className="glass-button primary" disabled={loading}>
                                {loading ? t('processing') : t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
