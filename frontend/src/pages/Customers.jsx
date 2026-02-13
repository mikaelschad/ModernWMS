import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/GlassCard'
import Button from '../components/common/Button'
import PermissionGate from '../components/common/PermissionGate'
import '../styles/master-data.css'

export default function Customers() {
    const { t } = useTranslation()
    const { hasPermission } = useAuth()

    // Updated init state with Synapse fields
    const init = {
        id: '',
        name: '',
        address1: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        status: 'A',
        allowPartialShipment: true,
        allowOverage: false,
        overageTolerance: 0,
        defaultTrackLot: false,
        defaultTrackSerial: false,
        defaultTrackExpDate: false,
        defaultTrackMfgDate: false,
        allowMixSKU: false,
        allowMixLot: false,
        receiveRule_RequireExpDate: false,
        receiveRule_RequireMfgDate: false,
        receiveRule_LotValidationRegex: '',
        receiveRule_SerialValidationRegex: '',
        receiveRule_MinShelfLifeDays: 0
    }

    const [items, setItems] = useState([])
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [activeTab, setActiveTab] = useState('general')

    const tabs = [
        { id: 'general', label: t('general') },
        { id: 'receiving', label: t('receiving_rules') },
        { id: 'shipping', label: t('shipping_rules') },
        { id: 'inventory', label: t('inventory_control') }
    ]

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/Customer')
            setItems(res.data)
        } catch (err) {
            setError(t('error_fetch', { item: t('customers') }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `http://localhost:5017/api/Customer/${formData.id}` : 'http://localhost:5017/api/Customer'

        try {
            const res = await axios({ method, url, data: formData })
            setSuccessMsg(isEditing ? t('success_updated', { item: t('customer') }) : t('success_created', { item: t('customer') }))
            setError(null)
            setIsEditing(false)
            setFormData(init)
            fetchItems()
        } catch (err) {
            console.error('Caught error:', err)
            const errorText = err.response?.data || err.message
            setError(typeof errorText === 'string' ? errorText : t('error_save'))
            setSuccessMsg(null)
        }
    }

    const handleEdit = (item) => {
        setFormData(item)
        setIsEditing(true)
    }

    const handleDelete = async (id) => {
        if (!confirm(t('confirm_delete', { item: id }))) return
        try {
            await axios.delete(`http://localhost:5017/api/Customer/${id}`)
            setSuccessMsg(t('success_deleted', { item: t('customer') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
        }
    }

    const isDisabled = isEditing ? !hasPermission("CUSTOMER_UPDATE") : !hasPermission("CUSTOMER_CREATE")

    return (
        <div className="master-data-page">
            <header className="page-header">
                <h2>{t('customers')}</h2>
                <p>{t('customers_desc', 'Manage your customer master data')}</p>
            </header>

            {error && <div className="error-msg">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            <PermissionGate permission="CUSTOMER_READ">
                <GlassCard title={isEditing ? (hasPermission("CUSTOMER_UPDATE") ? t('edit') : t('view')) : t('create')}>
                    <div className="items-tabs-container">
                        <div className="tabs-header">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="master-form">
                            <div className="tab-content">
                                {activeTab === 'general' && (
                                    <div className="item-form-grid">
                                        <div className="form-group">
                                            <label>{t('id')}</label>
                                            <input
                                                type="text"
                                                value={formData.id}
                                                onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                                required
                                                disabled={isEditing || isDisabled}
                                                maxLength={30}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                disabled={isDisabled}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('address')}</label>
                                            <input
                                                type="text"
                                                value={formData.address1}
                                                onChange={e => setFormData({ ...formData, address1: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('city')}</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={50}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('state')}</label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={50}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('phone')}</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={50}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('email')}</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('status')}</label>
                                            <select
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                disabled={isDisabled}
                                            >
                                                <option value="A">{t('active')}</option>
                                                <option value="I">{t('inactive')}</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'receiving' && (
                                    <div className="item-form-grid">
                                        <h4 style={{ width: '100%', marginBottom: '1rem', color: 'var(--primary-color)' }}>{t('validation_requirements')}</h4>

                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkRrExp"
                                                checked={formData.receiveRule_RequireExpDate}
                                                onChange={e => setFormData({ ...formData, receiveRule_RequireExpDate: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkRrExp">{t('require_exp_date')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkRrMfg"
                                                checked={formData.receiveRule_RequireMfgDate}
                                                onChange={e => setFormData({ ...formData, receiveRule_RequireMfgDate: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkRrMfg">{t('require_mfg_date')}</label>
                                        </div>

                                        <div className="form-group">
                                            <label>{t('lot_validation_regex')}</label>
                                            <input
                                                type="text"
                                                value={formData.receiveRule_LotValidationRegex || ''}
                                                onChange={e => setFormData({ ...formData, receiveRule_LotValidationRegex: e.target.value })}
                                                disabled={isDisabled}
                                                placeholder="e.g. ^LOT-\d{4}$"
                                                maxLength={255}
                                            />
                                            <small style={{ color: 'var(--text-muted)' }}>Regex pattern for Lot No.</small>
                                        </div>
                                        <div className="form-group">
                                            <label>{t('serial_validation_regex')}</label>
                                            <input
                                                type="text"
                                                value={formData.receiveRule_SerialValidationRegex || ''}
                                                onChange={e => setFormData({ ...formData, receiveRule_SerialValidationRegex: e.target.value })}
                                                disabled={isDisabled}
                                                placeholder="e.g. ^SN[A-Z]{2}\d{6}$"
                                                maxLength={255}
                                            />
                                            <small style={{ color: 'var(--text-muted)' }}>Regex pattern for Serial No.</small>
                                        </div>

                                        <div className="form-group">
                                            <label>{t('min_shelf_life_days')}</label>
                                            <input
                                                type="number"
                                                value={formData.receiveRule_MinShelfLifeDays}
                                                onChange={e => setFormData({ ...formData, receiveRule_MinShelfLifeDays: parseInt(e.target.value) || 0 })}
                                                disabled={isDisabled}
                                                min="0"
                                            />
                                            <small style={{ color: 'var(--text-muted)' }}>Days of remaining life required at receipt</small>
                                        </div>

                                        <div className="divider" style={{ width: '100%', margin: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                                        <h4 style={{ width: '100%', marginBottom: '1rem' }}>{t('overage_tolerance')}</h4>

                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkOverage"
                                                checked={formData.allowOverage}
                                                onChange={e => setFormData({ ...formData, allowOverage: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkOverage">{t('allow_overage')}</label>
                                        </div>
                                        {formData.allowOverage && (
                                            <div className="form-group">
                                                <label>{t('overage_tolerance')} (%)</label>
                                                <input
                                                    type="number"
                                                    value={formData.overageTolerance}
                                                    onChange={e => setFormData({ ...formData, overageTolerance: e.target.value })}
                                                    disabled={isDisabled}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        )}

                                        <div className="divider" style={{ width: '100%', margin: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                                        <h4 style={{ width: '100%', marginBottom: '1rem' }}>{t('default_tracking_requirements')}</h4>

                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkDefLot"
                                                checked={formData.defaultTrackLot}
                                                onChange={e => setFormData({ ...formData, defaultTrackLot: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkDefLot">{t('default_track_lot')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkDefSerial"
                                                checked={formData.defaultTrackSerial}
                                                onChange={e => setFormData({ ...formData, defaultTrackSerial: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkDefSerial">{t('default_track_serial')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkDefExp"
                                                checked={formData.defaultTrackExpDate}
                                                onChange={e => setFormData({ ...formData, defaultTrackExpDate: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkDefExp">{t('default_track_exp')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkDefMfg"
                                                checked={formData.defaultTrackMfgDate}
                                                onChange={e => setFormData({ ...formData, defaultTrackMfgDate: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkDefMfg">{t('default_track_mfg')}</label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'shipping' && (
                                    <div className="item-form-grid">
                                        <div className="checkbox-group full-width">
                                            <input
                                                type="checkbox"
                                                id="chkPartial"
                                                checked={formData.allowPartialShipment}
                                                onChange={e => setFormData({ ...formData, allowPartialShipment: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkPartial">{t('allow_partial_shipment')}</label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'inventory' && (
                                    <div className="item-form-grid">
                                        <div className="checkbox-group full-width">
                                            <input
                                                type="checkbox"
                                                id="chkMixSKU"
                                                checked={formData.allowMixSKU}
                                                onChange={e => setFormData({ ...formData, allowMixSKU: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkMixSKU">{t('allow_mix_sku')}</label>
                                        </div>
                                        <div className="checkbox-group full-width">
                                            <input
                                                type="checkbox"
                                                id="chkMixLot"
                                                checked={formData.allowMixLot}
                                                onChange={e => setFormData({ ...formData, allowMixLot: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkMixLot">{t('allow_mix_lot')}</label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions" style={{ marginTop: '2rem' }}>
                                <Button
                                    type="submit"
                                    disabled={isDisabled}
                                >
                                    {isEditing ? t('update') : t('create')}
                                </Button>
                                {(isEditing || formData.id) && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setFormData(init)
                                            setIsEditing(false)
                                        }}
                                        variant="secondary"
                                    >
                                        {isEditing ? t('cancel') : t('clear')}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </GlassCard >
            </PermissionGate >

            <GlassCard title={`${t('customers')} (${items.length})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('name')}</th>
                                <th>{t('city')}</th>
                                <th>{t('phone')}</th>
                                <th>{t('email')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.city}</td>
                                    <td>{item.phone}</td>
                                    <td>{item.email}</td>
                                    <td>
                                        <span className={`status-badge ${item.status === 'A' ? 'status-active' : 'status-inactive'}`}>
                                            {item.status === 'A' ? t('active') : t('inactive')}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleEdit(item)}
                                            className="btn-edit"
                                        >
                                            {hasPermission("CUSTOMER_UPDATE") ? t('edit') : t('view')}
                                        </Button>
                                        <PermissionGate permission="CUSTOMER_UPDATE">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(item.id)}
                                                className="btn-delete"
                                            >
                                                {t('delete')}
                                            </Button>
                                        </PermissionGate>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div >
    )
}
