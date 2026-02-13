/**
 * API Configuration
 * Centralized API base URL configuration using environment variables
 * 
 * For development: uses localhost:5017
 * For production: set VITE_API_BASE_URL in .env or .env.production
 * 
 * Example .env.production:
 * VITE_API_BASE_URL=https://api.yourserver.com
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5017';

export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/api/Auth/login`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/Auth/change-password`,

    // Users
    USERS: `${API_BASE_URL}/api/User`,
    USER_BY_ID: (id) => `${API_BASE_URL}/api/User/${id}`,

    // Roles
    ROLES: `${API_BASE_URL}/api/Role`,
    PERMISSIONS: `${API_BASE_URL}/api/Role/permissions`,
    ROLE_PERMISSIONS: (roleId) => `${API_BASE_URL}/api/Role/${roleId}/permissions`,

    // Facilities
    FACILITIES: `${API_BASE_URL}/api/Facility`,
    FACILITY_BY_ID: (id) => `${API_BASE_URL}/api/Facility/${id}`,

    // Customers
    CUSTOMERS: `${API_BASE_URL}/api/Customer`,
    CUSTOMER_BY_ID: (id) => `${API_BASE_URL}/api/Customer/${id}`,

    // Items
    ITEMS: `${API_BASE_URL}/api/Item`,
    ITEM_BY_ID: (id) => `${API_BASE_URL}/api/Item/${id}`,

    // Item Groups
    ITEM_GROUPS: `${API_BASE_URL}/api/ItemGroup`,
    ITEM_GROUP_BY_ID: (id) => `${API_BASE_URL}/api/ItemGroup/${id}`,

    // Zones
    ZONES: `${API_BASE_URL}/api/Zone`,
    ZONE_BY_ID: (id) => `${API_BASE_URL}/api/Zone/${id}`,

    // Sections
    SECTIONS: `${API_BASE_URL}/api/Section`,
    SECTION_BY_ID: (id) => `${API_BASE_URL}/api/Section/${id}`,

    // Locations
    LOCATIONS: `${API_BASE_URL}/api/Location`,
    LOCATION_BY_ID: (id) => `${API_BASE_URL}/api/Location/${id}`,
    LOCATION_TYPES: `${API_BASE_URL}/api/LocationType`,
    LOCATION_TYPE_BY_ID: (id) => `${API_BASE_URL}/api/LocationType/${id}`,

    // Consignees
    CONSIGNEES: `${API_BASE_URL}/api/Consignee`,
    CONSIGNEE_BY_ID: (id) => `${API_BASE_URL}/api/Consignee/${id}`,

    // License Plates
    LICENSE_PLATES: `${API_BASE_URL}/api/LicensePlate`,
    LICENSE_PLATE_SEARCH: `${API_BASE_URL}/api/LicensePlate/search`,
    LICENSE_PLATE_BY_ID: (id) => `${API_BASE_URL}/api/LicensePlate/${id}`,
    LICENSE_PLATE_AI_SUGGEST: (id) => `${API_BASE_URL}/api/LicensePlate/${id}/ai-suggestion`,

    // Audit Logs
    AUDIT_LOGS: `${API_BASE_URL}/api/Audit`,
    AUDIT_LOGS_BY_TABLE: (tableName) => `${API_BASE_URL}/api/Audit/table/${tableName}`,
    AUDIT_LOGS_BY_RECORD: (tableName, recordId) => `${API_BASE_URL}/api/Audit/record/${tableName}/${recordId}`,
};

export default API_BASE_URL;
