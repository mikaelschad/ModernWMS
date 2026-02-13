import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * PermissionGate component
 * 
 * Used to wrap elements that require specific permissions to be viewed.
 * 
 * @param {string} permission - The permission string required (e.g., 'ITEM_CREATE')
 * @param {React.ReactNode} children - The elements to render if permission is granted
 * @param {React.ReactNode} fallback - Optional fallback element if permission is denied
 */
const PermissionGate = ({ permission, children, fallback = null }) => {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return fallback;
};

export default PermissionGate;
