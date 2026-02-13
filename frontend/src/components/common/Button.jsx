import React from 'react';
import './Button.css';

/**
 * reliable Button component for uniform styling.
 * @param {string} variant - 'primary', 'secondary', 'danger', 'icon'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} isLoading - shows spinner
 * @param {React.ReactNode} icon - icon component
 * @param {string} className - additional classes
 * @param {object} props - other button props
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon = null,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'mwms-btn';
    const variantClass = `mwms-btn--${variant}`;
    const sizeClass = `mwms-btn--${size}`;
    const loadingClass = isLoading ? 'mwms-btn--loading' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <span className="mwms-btn-spinner"></span>}
            {!isLoading && icon && <span className="mwms-btn-icon">{icon}</span>}
            <span className="mwms-btn-text">{children}</span>
        </button>
    );
};

export default Button;
