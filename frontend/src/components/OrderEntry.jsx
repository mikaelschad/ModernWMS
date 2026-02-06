import React, { useState } from 'react';
import GlassCard from './GlassCard';
import './OrderEntry.css';

const OrderEntry = () => {
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
        alert('Order Submitted Successfully!');
    };

    return (
        <GlassCard title="New Order Entry" className="order-entry-card">
            <form onSubmit={handleSubmit} className="order-entry-form">
                <div className="form-group-row">
                    <div className="form-group">
                        <label>Customer ID</label>
                        <input
                            type="text"
                            name="customerId"
                            placeholder="e.g. CUST-01"
                            value={formData.customerId}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Order Number</label>
                        <input
                            type="text"
                            name="orderNumber"
                            placeholder="e.g. ORD-10023"
                            value={formData.orderNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Item SKU</label>
                    <div className="sku-search-group">
                        <input
                            type="text"
                            name="sku"
                            placeholder="Search or scan SKU..."
                            value={formData.sku}
                            onChange={handleChange}
                        />
                        <button type="button" className="scan-btn">Scan</button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Quantity</label>
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
                    <p>AI Insight: High demand SKU. Recommended stock level: 250 units.</p>
                </div>

                <button type="submit" className="submit-btn">
                    Create Transaction
                </button>
            </form>
        </GlassCard>
    );
};

export default OrderEntry;
