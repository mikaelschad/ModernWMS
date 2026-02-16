import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const ChangePassword = () => {
    const { t } = useTranslation('translation');
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useToast();
    const { completePasswordChange } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    // Password Policy
    const policy = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigit: true,
        requireSpecialChar: true
    };

    const validatePassword = (password) => {
        return {
            length: password.length >= policy.minLength,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            digit: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    };

    const requirements = validatePassword(formData.newPassword);
    const isPolicyMet = Object.values(requirements).every(Boolean);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            showError(t('passwordsDoNotMatch'));
            return;
        }

        if (!isPolicyMet) {
            showError(t('passwordDoesNotMeetPolicy'));
            return;
        }

        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            showSuccess(t('passwordChangedSuccessfully'));

            // Clear inputs immediately
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Mark as complete in context (removes redirect)
            completePasswordChange();

            // Navigate after toast is seen
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            showError(err.response?.data?.message || t('errorChangingPassword'));
        } finally {
            setLoading(false);
        }
    };

    const RequirementItem = ({ met, text }) => (
        <div className={`requirement-item ${met ? 'met' : 'unmet'}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            color: met ? 'var(--success-color)' : 'var(--text-secondary)',
            marginBottom: '4px'
        }}>
            <span style={{ color: met ? 'var(--success-color)' : 'var(--danger-color)' }}>
                {met ? '✓' : '○'}
            </span>
            {text}
        </div>
    );

    return (
        <div className="settings-container">
            <div className="glass-panel" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                <div className="panel-header">
                    <h2>{t('changePassword')}</h2>
                </div>
                <div className="panel-content">
                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="form-group">
                            <label>{t('currentPassword')}</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                className="glass-input"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('newPassword')}</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="glass-input"
                                maxLength={100}
                                placeholder={t('enterNewPassword')}
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Password Strength Indicators */}
                        <div className="password-requirements" style={{
                            background: 'rgba(0,0,0,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>{t('passwordRequirements')}:</h4>
                            <RequirementItem met={requirements.length} text={`${t('minimumLength')}: ${policy.minLength}`} />
                            <RequirementItem met={requirements.upper} text={t('uppercaseLetter')} />
                            <RequirementItem met={requirements.lower} text={t('lowercaseLetter')} />
                            <RequirementItem met={requirements.digit} text={t('number')} />
                            <RequirementItem met={requirements.special} text={t('specialCharacter')} />
                        </div>

                        <div className="form-group">
                            <label>{t('confirmPassword')}</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="glass-input"
                                maxLength={100}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={loading}
                                style={{ flex: 2 }}
                                disabled={!isPolicyMet || !formData.currentPassword || !formData.confirmPassword}
                            >
                                {t('save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
