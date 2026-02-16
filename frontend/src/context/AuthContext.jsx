import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const completePasswordChange = () => {
        localStorage.setItem('mustChangePassword', 'false');
        setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
    };

    // Configure axios default header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            try {
                const decoded = jwtDecode(token);
                // Extract roles from claims. Microsoft IdentityModel often uses 
                // "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" 
                // or simply "role" if configured simpler. 
                // But our AuthController uses ClaimTypes.Role which maps to the long URL usually.
                // Let's check both or normalize.
                const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'] || [];
                const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];

                // Load permissions from localStorage if available
                const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
                const mcp = localStorage.getItem('mustChangePassword') === 'true';

                setUser({
                    username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || decoded.sub,
                    roles: roles,
                    permissions: permissions,
                    mustChangePassword: mcp
                });
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await axios.post(API_ENDPOINTS.LOGIN, {
                username,
                password
            });
            const { token, roles, permissions } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('permissions', JSON.stringify(permissions || []));
            // Store mustChangePassword flag
            const mcp = response.data.mustChangePassword || false;
            localStorage.setItem('mustChangePassword', String(mcp));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            // We rely on effect to update user, but we should update localStorage first
            return true;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
    };

    const hasRole = (roleName) => {
        return user && user.roles && user.roles.includes(roleName);
    };

    const hasPermission = (permission) => {
        // ADMIN always has all permissions
        if (hasRole('ADMIN')) return true;
        return user && user.permissions && user.permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout, hasRole, hasPermission, completePasswordChange }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
