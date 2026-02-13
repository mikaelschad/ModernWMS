import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import '../components/Toast.css';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'error', duration = 5000) => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration = 4000) => showToast(message, 'success', duration), [showToast]);
    const error = useCallback((message, duration = 6000) => showToast(message, 'error', duration), [showToast]);
    const warning = useCallback((message, duration = 5000) => showToast(message, 'warning', duration), [showToast]);
    const info = useCallback((message, duration = 4000) => showToast(message, 'info', duration), [showToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
