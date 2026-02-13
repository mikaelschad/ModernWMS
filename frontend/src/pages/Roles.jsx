import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import Button from '../components/common/Button';
import './PlateLookup.css'; // Reusing glass card styles
import './Roles.css';

const Roles = () => {
    const { t } = useTranslation();
    const { success: showSuccess, error: showError } = useToast();
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                axios.get(API_ENDPOINTS.ROLES),
                axios.get(API_ENDPOINTS.PERMISSIONS)
            ]);
            setRoles(rolesRes.data);
            setAllPermissions(permsRes.data);
            setLoading(false);
        } catch (err) {
            showError('Failed to fetch roles and permissions');
            setLoading(false);
        }
    };

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        try {
            const res = await axios.get(API_ENDPOINTS.ROLE_PERMISSIONS(role.id));
            setRolePermissions(res.data);
        } catch (err) {
            showError('Failed to fetch permissions for ' + role.id);
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setRolePermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            await axios.post(API_ENDPOINTS.ROLE_PERMISSIONS(selectedRole.id), rolePermissions);
            showSuccess(`Permissions for ${selectedRole.id} updated successfully`);
        } catch (err) {
            showError('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    // Group permissions by entity
    const groupedPermissions = allPermissions.reduce((acc, p) => {
        if (!acc[p.entity]) acc[p.entity] = [];
        acc[p.entity].push(p);
        return acc;
    }, {});

    if (loading) return <div className="loading-spinner">{t('loading')}</div>;

    return (
        <div className="plate-lookup-container roles-page-container">
            <header className="page-header">
                <h2>{t('role_management')}</h2>
            </header>

            <div className="roles-layout">
                {/* Roles Sidebar */}
                <div className="glass-card roles-list-card">
                    <h3>{t('roles')}</h3>
                    <div className="roles-list">
                        {roles.map(r => (
                            <div
                                key={r.id}
                                className={`role-item ${selectedRole?.id === r.id ? 'active' : ''}`}
                                onClick={() => handleRoleSelect(r)}
                            >
                                <span className="role-id">{r.id}</span>
                                <span className="role-desc">{r.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permissions Panel */}
                <div className="glass-card permissions-panel-card">
                    <h3>
                        {selectedRole
                            ? `${t('permissions_for')} ${selectedRole.id}`
                            : t('select_role_to_manage')}
                    </h3>

                    {selectedRole && (
                        <>
                            <div className="permissions-grid">
                                {Object.keys(groupedPermissions).map(entity => (
                                    <div key={entity} className="permission-group">
                                        <h4>{entity}</h4>
                                        <div className="permission-items">
                                            {groupedPermissions[entity].map(p => (
                                                <label key={p.id} className="permission-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={rolePermissions.includes(p.id)}
                                                        onChange={() => handlePermissionToggle(p.id)}
                                                        disabled={selectedRole.id === 'ADMIN'} // Optional: protect ADMIN
                                                    />
                                                    <span className="checkbox-custom"></span>
                                                    <div className="permission-info">
                                                        <span className="op-tag">{p.operation}</span>
                                                        <span className="op-desc">{p.description}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="panel-actions">
                                <Button
                                    className="save-btn"
                                    onClick={handleSave}
                                    disabled={saving || selectedRole.id === 'ADMIN'}
                                    isLoading={saving}
                                >
                                    {saving ? t('loading') : t('save_changes')}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Roles;
