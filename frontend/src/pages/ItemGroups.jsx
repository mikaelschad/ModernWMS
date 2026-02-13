import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/GlassCard'
import EntitySelector from '../components/EntitySelector'
import Button from '../components/common/Button'
import PermissionGate from '../components/common/PermissionGate'
import '../styles/master-data.css'
import './Items.css' // Reuse Items CSS for now

export default function ItemGroups() {
    const { t } = useTranslation()
    const { hasPermission } = useAuth()
    const { success, error: showError } = useToast()

    const init = {
        id: '',
        description: '',
        customerId: '',
        category: '',
        baseUOM: 'EA',
        trackLotNumber: false,
        trackSerialNumber: false,
        trackExpirationDate: false,
        trackManufactureDate: false,
        isHazardous: false,
        hazardClass: '',
        unNumber: '',
        packingGroup: '',
        commodityCode: '',
        countryOfOrigin: '',
        velocityClass: ''
    }

    const [groups, setGroups] = useState([])
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(localStorage.getItem('selectedCustomer') || '')
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState('general')

    const tabs = [
        { id: 'general', label: t('general') },
        { id: 'tracking', label: t('tracking') },
        { id: 'logistics', label: t('logistics') },
        { id: 'hazardous', label: t('hazardous') }
    ]

    useEffect(() => {
        fetchGroups()
        fetchCustomers()
    }, [])

    useEffect(() => {
        if (selectedCustomer) {
            setFormData(prev => ({ ...prev, customerId: selectedCustomer }))
        }
    }, [selectedCustomer])

    const handleCustomerChange = (customerId) => {
        setSelectedCustomer(customerId)
        localStorage.setItem('selectedCustomer', customerId)
        setFormData(prev => ({ ...prev, customerId }))
    }

    const filteredGroups = selectedCustomer
        ? groups.filter(g => g.customerId === selectedCustomer)
        : groups

    const fetchGroups = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/ItemGroup')
            setGroups(res.data)
        } catch (err) {
            console.error(err)
            showError(t('error_fetch', { item: t('item_groups') }))
        }
    }

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/Customer')
            setCustomers(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing
            ? `http://localhost:5017/api/ItemGroup/${formData.id}`
            : 'http://localhost:5017/api/ItemGroup'

        const payload = { ...formData }
        // Nullify empty strings for nullable fields
        const nullables = ['category', 'hazardClass', 'unNumber', 'packingGroup', 'commodityCode', 'countryOfOrigin', 'velocityClass']
        nullables.forEach(f => {
            if (payload[f] === '') payload[f] = null
        })

        try {
            await axios({ method, url, data: payload })
            success(isEditing ? t('success_updated', { item: t('item_group') }) : t('success_created', { item: t('item_group') }))
            setIsEditing(false)
            setFormData(init)
            fetchGroups()
        } catch (err) {
            const errorText = err.response?.data || err.message
            showError(typeof errorText === 'string' ? errorText : t('error_save'))
        }
    }

    const handleEdit = (group) => {
        setFormData(group)
        setIsEditing(true)
    }

    const handleDelete = async (id, customerId) => {
        if (!confirm(t('confirm_delete', { item: id }))) return
        try {
            await axios.delete(`http://localhost:5017/api/ItemGroup/${id}`, { params: { customerId } })
            success(t('success_deleted', { item: t('item_group') }))
            fetchGroups()
        } catch (err) {
            showError(err.response?.data || err.message)
        }
    }

    const isDisabled = isEditing ? !hasPermission("ITEMGROUP_UPDATE") : !hasPermission("ITEMGROUP_CREATE")

    return (
        <div className="master-data-page">
            <header className="page-header">
                <h2>{t('item_groups')}</h2>
                <p>{t('item_groups_desc', 'Manage item templates and categories')}</p>
            </header>

            <GlassCard title={t('select_customer')}>
                <EntitySelector
                    items={customers}
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    displayField="name"
                    valueField="id"
                    placeholder={t('all_customers')}
                />
            </GlassCard>

            <PermissionGate permission="ITEMGROUP_READ">
                <GlassCard title={isEditing ? t('edit') : t('create')}>
                    <div className="items-tabs-container">
                        <div className="tabs-header">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
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
                                                disabled={isEditing}
                                                maxLength={30}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('description')}</label>
                                            <input
                                                type="text"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={100}
                                            />
                                        </div>
                                        <EntitySelector
                                            items={customers}
                                            value={formData.customerId}
                                            onChange={val => setFormData({ ...formData, customerId: val })}
                                            label={t('customer')}
                                            disabled={isDisabled || !!selectedCustomer}
                                            displayField="name"
                                            valueField="id"
                                            required
                                        />
                                        <div className="form-group">
                                            <label>{t('category')}</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={20}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('base_uom')}</label>
                                            <input
                                                type="text"
                                                value={formData.baseUOM}
                                                onChange={e => setFormData({ ...formData, baseUOM: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'tracking' && (
                                    <div className="item-form-grid">
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkLot"
                                                checked={formData.trackLotNumber}
                                                onChange={e => setFormData({ ...formData, trackLotNumber: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkLot">{t('track_lot_number')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkSerial"
                                                checked={formData.trackSerialNumber}
                                                onChange={e => setFormData({ ...formData, trackSerialNumber: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkSerial">{t('track_serial_number')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkExp"
                                                checked={formData.trackExpirationDate}
                                                onChange={e => setFormData({ ...formData, trackExpirationDate: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkExp">{t('track_exp_date')}</label>
                                        </div>
                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="chkMfg"
                                                checked={formData.trackManufactureDate}
                                                onChange={e => setFormData({ ...formData, trackManufactureDate: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkMfg">{t('track_mfg_date')}</label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'logistics' && (
                                    <div className="item-form-grid">
                                        <div className="form-group">
                                            <label>{t('commodity_code')}</label>
                                            <input
                                                type="text"
                                                value={formData.commodityCode}
                                                onChange={e => setFormData({ ...formData, commodityCode: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={20}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('country_of_origin')}</label>
                                            <input
                                                type="text"
                                                value={formData.countryOfOrigin}
                                                onChange={e => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                                                disabled={isDisabled}
                                                maxLength={50}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('velocity_class')}</label>
                                            <select
                                                value={formData.velocityClass}
                                                onChange={e => setFormData({ ...formData, velocityClass: e.target.value })}
                                                disabled={isDisabled}
                                            >
                                                <option value="">{t('select')}</option>
                                                <option value="A">A - High</option>
                                                <option value="B">B - Medium</option>
                                                <option value="C">C - Low</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'hazardous' && (
                                    <div className="item-form-grid">
                                        <div className="checkbox-group full-width">
                                            <input
                                                type="checkbox"
                                                id="chkHaz"
                                                checked={formData.isHazardous}
                                                onChange={e => setFormData({ ...formData, isHazardous: e.target.checked })}
                                                disabled={isDisabled}
                                            />
                                            <label htmlFor="chkHaz">{t('is_hazardous')}</label>
                                        </div>
                                        {formData.isHazardous && (
                                            <>
                                                <div className="form-group">
                                                    <label>{t('un_number')}</label>
                                                    <input
                                                        type="text"
                                                        value={formData.unNumber}
                                                        onChange={e => setFormData({ ...formData, unNumber: e.target.value })}
                                                        disabled={isDisabled}
                                                        maxLength={20}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>{t('hazard_class')}</label>
                                                    <input
                                                        type="text"
                                                        value={formData.hazardClass}
                                                        onChange={e => setFormData({ ...formData, hazardClass: e.target.value })}
                                                        disabled={isDisabled}
                                                        maxLength={20}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>{t('packing_group')}</label>
                                                    <input
                                                        type="text"
                                                        value={formData.packingGroup}
                                                        onChange={e => setFormData({ ...formData, packingGroup: e.target.value })}
                                                        disabled={isDisabled}
                                                        maxLength={20}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-actions" style={{ marginTop: '2rem' }}>
                                {!isDisabled && (
                                    <Button type="submit" className="btn-primary">
                                        {isEditing ? t('update') : t('create')}
                                    </Button>
                                )}
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
                </GlassCard>
            </PermissionGate>

            <GlassCard title={`${t('item_groups')} (${filteredGroups.length})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('description')}</th>
                                <th>{t('category')}</th>
                                <th>{t('uom')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroups.map(group => (
                                <tr key={group.id}>
                                    <td>{group.id}</td>
                                    <td>{group.description}</td>
                                    <td>{group.category}</td>
                                    <td>{group.baseUOM}</td>
                                    <td className="actions">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleEdit(group)}
                                        >
                                            {hasPermission("ITEMGROUP_UPDATE") ? t('edit') : t('view')}
                                        </Button>
                                        <PermissionGate permission="ITEMGROUP_UPDATE">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(group.id, group.customerId)}
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
        </div>
    )
}
