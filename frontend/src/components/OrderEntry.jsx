import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import GlassCard from './GlassCard';
import './OrderEntry.css';

const OrderEntry = () => {
    const { t } = useTranslation();
    const { success } = useToast();
    const [formData, setFormData] = useState({
        customerId: '',
        orderNumber: '',
        sku: '',
        quantity: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting Order:', formData);
        success(t('success_created', { item: t('order_number') }));
    };

    return (
        <GlassCard title={t('new_order_entry')} className="order-entry-card">
            <form onSubmit={handleSubmit} className="order-entry-form">
                <div className="form-group-row">
                    <div className="form-group">
                        <label>{t('customer_id')}</label>
                        <input
                            type="text"
                            name="customerId"
                            placeholder={t('eg_cust_01') || "e.g. CUST-01"}
                            value={formData.customerId}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('order_number')}</label>
                        <input
                            type="text"
                            name="orderNumber"
                            placeholder={t('eg_ord_10023') || "e.g. ORD-10023"}
                            value={formData.orderNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>{t('item_sku')}</label>
                    <div className="sku-search-group">
                        <input
                            type="text"
                            name="sku"
                            placeholder={t('search_scan_sku')}
                            value={formData.sku}
                            onChange={handleChange}
                        />
                        <button type="button" className="scan-btn">{t('scan')}</button>
                    </div>
                </div>

                <div className="form-group">
                    <label>{t('quantity')}</label>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={handleChange}
                    />
                </div>

                <div className="ai-insight">
                    <span className="ai-icon">✨</span>
                    <p>{t('ai_insight_high_demand', { recommended: 250 })}</p>
                </div>

                <button type="submit" className="submit-btn">
                    {t('create_transaction')}
                </button>
            </form>
        </GlassCard>
    );
};

export default OrderEntry;
