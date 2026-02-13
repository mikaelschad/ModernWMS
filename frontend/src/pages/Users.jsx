import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import TagSelect from '../components/TagSelect';
import Button from '../components/common/Button';
import { API_ENDPOINTS } from '../config/api';
import PermissionGate from '../components/common/PermissionGate';
import './PlateLookup.css'; // Reusing styles
import './Users.css';

const Users = () => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const { theme } = useTheme();
    const { success: showSuccess, error: showError } = useToast();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        password: '',
        facilityId: '',
        roles: [],
        accessibleFacilities: [],
        accessibleCustomers: []
    });

    useEffect(() => {
        fetchData();
        fetchMetadata();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.USERS);
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [rolesRes, facRes] = await Promise.all([
                axios.get(API_ENDPOINTS.ROLES),
                axios.get(API_ENDPOINTS.FACILITIES)
            ]);
            setRoles(rolesRes.data);
            setFacilities(facRes.data);

            // Try fetch customers if endpoint exists, otherwise empty
            try {
                const custRes = await axios.get(API_ENDPOINTS.CUSTOMERS);
                setCustomers(custRes.data);
            } catch (e) {
                console.warn("Failed to fetch customers or endpoint missing", e);
            }
        } catch (err) {
            console.error("Failed to fetch metadata", err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            id: user.id || '',
            name: user.name || '',
            password: '', // Don't show password
            facilityId: user.facilityId || '',
            roles: user.roles || [],
            accessibleFacilities: user.accessibleFacilities || [],
            accessibleCustomers: user.accessibleCustomers || []
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            id: '',
            name: '',
            password: '',
            facilityId: '',
            roles: [],
            accessibleFacilities: [],
            accessibleCustomers: []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete'))) {
            try {
                await axios.delete(API_ENDPOINTS.USER_BY_ID(id));
                showSuccess('User deleted successfully');
                fetchData();
            } catch (err) {
                showError('Failed to delete user');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            if (editingUser) {
                await axios.put(API_ENDPOINTS.USER_BY_ID(editingUser.id), payload);
                showSuccess('User updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.USERS, payload);
                showSuccess('User created successfully');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            let errorMessage = 'Unknown error';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else {
                    errorMessage = JSON.stringify(err.response.data);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            showError('Failed to save user: ' + errorMessage);
        }
    };

    const toggleSelection = (list, item) => {
        return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    };

    return (
        <div className="plate-lookup-container users-page-container">
            <header className="page-header">
                <h2>{t('users')}</h2>
                <PermissionGate permission="USER_CREATE">
                    <div className="header-actions">
                        <Button onClick={handleCreate}>
                            {t('add_user', '+ Add User')}
                        </Button>
                    </div>
                </PermissionGate>
            </header>

            {error && <div className="error-msg">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}

            <div className="glass-card">
                <table className="lookup-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Roles</th>
                            <th>Default Facility</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>{u.roles?.join(', ')}</td>
                                <td>{u.facilityId}</td>
                                <td>
                                    <PermissionGate permission="USER_UPDATE">
                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(u)}>✏️</Button>
                                    </PermissionGate>
                                    <PermissionGate permission="USER_DISABLE">
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>🗑️</Button>
                                    </PermissionGate>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>User ID</label>
                                <input
                                    className="glass-input"
                                    value={formData.id}
                                    onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                    style={{ textTransform: 'uppercase' }}
                                    disabled={!!editingUser}
                                    required
                                    maxLength={20}
                                />
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    className="glass-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    maxLength={100}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                                <input
                                    className="glass-input"
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    maxLength={100}
                                />
                            </div>
                            <div className="form-group">
                                <label>Default Facility</label>
                                <select
                                    className="glass-input"
                                    value={formData.facilityId}
                                    onChange={e => setFormData({ ...formData, facilityId: e.target.value })}
                                >
                                    <option value="">-- None --</option>
                                    {facilities.map(f => <option key={f.id} value={f.id}>{f.id} - {f.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Roles</label>
                                <div className="checkbox-group">
                                    {roles.map(r => (
                                        <label key={r.id} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(r.id)}
                                                onChange={() => setFormData({ ...formData, roles: toggleSelection(formData.roles, r.id) })}
                                            />
                                            {r.id}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Accessible Facilities</label>
                                <TagSelect
                                    options={facilities}
                                    selected={formData.accessibleFacilities}
                                    onChange={(selected) => setFormData({ ...formData, accessibleFacilities: selected })}
                                    placeholder="Select facilities..."
                                    allowAll={true}
                                />
                            </div>

                            <div className="form-group">
                                <label>Accessible Customers</label>
                                <TagSelect
                                    options={customers}
                                    selected={formData.accessibleCustomers}
                                    onChange={(selected) => setFormData({ ...formData, accessibleCustomers: selected })}
                                    placeholder="Select customers..."
                                    allowAll={true}
                                />
                            </div>

                            <div className="modal-actions">
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
