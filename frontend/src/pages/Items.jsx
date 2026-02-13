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
import './Items.css'
import ItemAliases from '../components/ItemAliases'

export default function Items() {
    const { t } = useTranslation()
    const { hasPermission } = useAuth()
    const { success, error: showError } = useToast()
    const init = {
        id: '',
        sku: '',
        description: '',
        abbreviation: '',
        baseUOM: 'EA',
        itemGroupId: '',
        customerId: '',
        rateGroup: '',
        productGroup: '',
        kitType: '',
        requireCycleCount: false,
        requireLotNumber: false,
        requireSerialNumber: false,
        requireManufactureDate: false,
        requireExpirationDate: false,
        isHazardous: false,
        unNumber: '',
        hazardClass: '',
        packingGroup: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        volume: '',
        ti: '',
        hi: '',
        commodityCode: '',
        countryOfOrigin: '',
        velocityClass: '',
        status: 'A',
        minQty: '',
        maxQty: '',
        pickLocation: ''
    }
    const [items, setItems] = useState([])
    const [customers, setCustomers] = useState([])
    const [itemGroups, setItemGroups] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(localStorage.getItem('selectedCustomer') || '')
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState('item')
    const [activeSubTab, setActiveSubTab] = useState('name')

    const mainTabs = [
        { id: 'item', label: t('item') },
        { id: 'aliases', label: t('aliases') },
        { id: 'storage', label: t('storage') },
        { id: 'substitutes', label: t('substitutes') },
        { id: 'pick_profile', label: t('pick_profile') },
        { id: 'facility_settings', label: t('facility_settings') }
    ]

    const itemSubTabs = [
        { id: 'name', label: t('name') },
        { id: 'uom', label: t('uom') },
        { id: 'specs', label: t('specs') },
        { id: 'receiving', label: t('receiving') },
        { id: 'shipping', label: t('shipping') },
        { id: 'labeling', label: t('labeling') },
        { id: 'hazardous', label: t('hazardous') },
        { id: 'hazardous', label: t('hazardous') },
        { id: 'replenishment', label: t('replenishment') },
        { id: 'logistics', label: t('logistics') },
        { id: 'handling', label: t('handling') }
    ]

    useEffect(() => {
        fetchItems()
        fetchCustomers()
        fetchItemGroups()
    }, [])

    useEffect(() => {
        if (selectedCustomer) {
            setFormData(prev => ({ ...prev, customerId: selectedCustomer }))
        }
    }, [selectedCustomer])

    const handleCustomerChange = (customerId) => {
        setSelectedCustomer(customerId)
        localStorage.setItem('selectedCustomer', customerId)
        setFormData(prev => ({ ...prev, customerId, itemGroupId: '' }))
    }

    const filteredItems = selectedCustomer
        ? items.filter(item => item.customerId === selectedCustomer)
        : items

    const filteredItemGroups = selectedCustomer
        ? itemGroups.filter(group => group.customerId === selectedCustomer)
        : itemGroups

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/Item')
            setItems(res.data)
        } catch (err) {
            setError(t('error_fetch', { item: t('items') }))
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

    const fetchItemGroups = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/ItemGroup')
            setItemGroups(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `http://localhost:5017/api/Item/${formData.id}` : 'http://localhost:5017/api/Item'

        console.log('Submitting item:', formData)
        console.log('URL:', url, 'Method:', method)

        // Sanitize data: convert empty strings to null for numeric/nullable fields
        const payload = { ...formData }
        const numericFields = ['weight', 'length', 'width', 'height', 'volume', 'ti', 'hi', 'minQty', 'maxQty']
        const nullableFields = ['itemGroupId', 'customerId', 'rateGroup', 'productGroup', 'kitType', 'unNumber', 'hazardClass', 'packingGroup', 'commodityCode', 'countryOfOrigin', 'velocityClass', 'pickLocation']

        numericFields.forEach(field => {
            if (payload[field] === '') payload[field] = null
        })

        nullableFields.forEach(field => {
            if (payload[field] === '') payload[field] = null
        })

        try {
            const res = await axios({
                method,
                url,
                data: payload
            })

            console.log('Response status:', res.status)

            success(isEditing ? t('success_updated', { item: t('item') }) : t('success_created', { item: t('item') }))
            setIsEditing(false)
            setFormData(init)
            fetchItems()
        } catch (err) {
            console.error('Caught error:', err)
            const errorText = err.response?.data || err.message
            showError(typeof errorText === 'string' ? errorText : t('error_save'))
        }
    }

    const handleEdit = (item) => {
        setFormData(item)
        setIsEditing(true)
    }

    const handleDelete = async (id, customerId) => {
        if (!confirm(t('confirm_delete', { item: id }))) return

        try {
            await axios.delete(`http://localhost:5017/api/Item/${id}`, { params: { customerId } })
            success(t('success_deleted', { item: t('item') }))
            fetchItems()
        } catch (err) {
            showError(err.response?.data || err.message)
        }
    }

    const isDisabled = isEditing ? !hasPermission("ITEM_UPDATE") : !hasPermission("ITEM_CREATE")

    return (
        <div className="master-data-page">
            <header className="page-header">
                <h2>{t('items')}</h2>
                <p>{t('items_desc', 'Manage your item master data')}</p>
            </header>

            {/* Customer Filter */}
            <GlassCard title={t('select_customer')}>
                <EntitySelector
                    items={customers}
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    displayField="name"
                    valueField="id"
                    searchFields={['id', 'name', 'city']}
                    columns={[
                        { key: 'id', label: t('id') },
                        { key: 'name', label: t('name') },
                        { key: 'city', label: t('city') }
                    ]}
                    placeholder={t('all_customers')}
                />
            </GlassCard>

            <PermissionGate permission="ITEM_READ">
                <GlassCard title={isEditing ? (hasPermission("ITEM_UPDATE") ? t('edit') : t('view')) : t('create')}>
                    <div className="items-tabs-container">
                        {/* Main Tabs Header */}
                        <div className="tabs-header">
                            {mainTabs.map(tab => (
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
                                {activeTab === 'item' && (
                                    <>
                                        {/* Sub-Tabs Header */}
                                        <div className="sub-tabs-header">
                                            {itemSubTabs.map(tab => (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    className={`sub-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
                                                    onClick={() => setActiveSubTab(tab.id)}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="sub-tab-content">
                                            {activeSubTab === 'name' && (
                                                <div className="item-form-grid">
                                                    <div className="form-group">
                                                        <label>{t('id')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`${t('id')} *`}
                                                            value={formData.id}
                                                            onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                                            required
                                                            disabled={isEditing}
                                                            maxLength={30}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('sku')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('sku')}
                                                            value={formData.sku}
                                                            onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                                            disabled={isDisabled}
                                                            maxLength={50}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('description')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`${t('description')} *`}
                                                            value={formData.description}
                                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                            required
                                                            disabled={isDisabled}
                                                            maxLength={100}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('abbreviation')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('abbreviation')}
                                                            value={formData.abbreviation}
                                                            onChange={e => setFormData({ ...formData, abbreviation: e.target.value })}
                                                            disabled={isDisabled}
                                                            maxLength={20}
                                                        />
                                                    </div>
                                                    <EntitySelector
                                                        items={customers}
                                                        value={formData.customerId}
                                                        onChange={(value) => setFormData({ ...formData, customerId: value })}
                                                        label={t('customer')}
                                                        displayField="name"
                                                        valueField="id"
                                                        searchFields={['id', 'name', 'city']}
                                                        columns={[
                                                            { key: 'id', label: t('id') },
                                                            { key: 'name', label: t('name') },
                                                            { key: 'city', label: t('city') }
                                                        ]}
                                                        disabled={isDisabled || !!selectedCustomer}
                                                        placeholder={t('select_customer')}
                                                    />
                                                    <EntitySelector
                                                        items={filteredItemGroups}
                                                        value={formData.itemGroupId}
                                                        onChange={(value) => setFormData({ ...formData, itemGroupId: value })}
                                                        label={t('item_group')}
                                                        displayField="description"
                                                        valueField="id"
                                                        searchFields={['id', 'description', 'category']}
                                                        columns={[
                                                            { key: 'id', label: t('id') },
                                                            { key: 'description', label: t('description') },
                                                            { key: 'category', label: 'Category' }
                                                        ]}
                                                        disabled={isDisabled}
                                                        placeholder={t('select_item_group')}
                                                    />
                                                    <div className="form-group">
                                                        <label>{t('rate_group')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('rate_group')}
                                                            value={formData.rateGroup}
                                                            onChange={e => setFormData({ ...formData, rateGroup: e.target.value })}
                                                            disabled={isDisabled}
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('product_group')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('product_group')}
                                                            value={formData.productGroup}
                                                            onChange={e => setFormData({ ...formData, productGroup: e.target.value })}
                                                            disabled={isDisabled}
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('kit_type')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('kit_type')}
                                                            value={formData.kitType}
                                                            onChange={e => setFormData({ ...formData, kitType: e.target.value })}
                                                            disabled={isDisabled}
                                                            maxLength={10}
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

                                            {activeSubTab === 'uom' && (
                                                <div className="item-form-grid">
                                                    <div className="form-group">
                                                        <label>{t('uom')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('uom')}
                                                            value={formData.baseUOM}
                                                            onChange={e => setFormData({ ...formData, baseUOM: e.target.value })}
                                                            disabled={isDisabled}
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {activeSubTab === 'specs' && (
                                                <div className="item-form-grid">
                                                    <div className="form-group">
                                                        <label>{t('weight')}</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder={t('weight')}
                                                            value={formData.weight}
                                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                                            disabled={isDisabled}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('length')}</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder={t('length')}
                                                            value={formData.length}
                                                            onChange={e => setFormData({ ...formData, length: e.target.value })}
                                                            disabled={isDisabled}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('width')}</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder={t('width')}
                                                            value={formData.width}
                                                            onChange={e => setFormData({ ...formData, width: e.target.value })}
                                                            disabled={isDisabled}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('height')}</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder={t('height')}
                                                            value={formData.height}
                                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                            disabled={isDisabled}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('volume')}</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder={t('volume')}
                                                            value={formData.volume}
                                                            onChange={e => setFormData({ ...formData, volume: e.target.value })}
                                                            disabled={isDisabled}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {activeSubTab === 'receiving' && (
                                                <div className="item-form-grid">
                                                    <div className="checkbox-group">
                                                        <input
                                                            type="checkbox"
                                                            id="chkCycle"
                                                            checked={formData.requireCycleCount}
                                                            onChange={e => setFormData({ ...formData, requireCycleCount: e.target.checked })}
                                                            disabled={isDisabled}
                                                        />
                                                        <label htmlFor="chkCycle">{t('require_cycle_count')}</label>
                                                    </div>
                                                    <div className="checkbox-group">
                                                        <input
                                                            type="checkbox"
                                                            id="chkLot"
                                                            checked={formData.requireLotNumber}
                                                            onChange={e => setFormData({ ...formData, requireLotNumber: e.target.checked })}
                                                            disabled={isDisabled}
                                                        />
                                                        <label htmlFor="chkLot">{t('require_lot_number')}</label>
                                                    </div>
                                                    <div className="checkbox-group">
                                                        <input
                                                            type="checkbox"
                                                            id="chkSerial"
                                                            checked={formData.requireSerialNumber}
                                                            onChange={e => setFormData({ ...formData, requireSerialNumber: e.target.checked })}
                                                            disabled={isDisabled}
                                                        />
                                                        <label htmlFor="chkSerial">{t('require_serial_number')}</label>
                                                    </div>
                                                    <div className="checkbox-group">
                                                        <input
                                                            type="checkbox"
                                                            id="chkMfg"
                                                            checked={formData.requireManufactureDate}
                                                            onChange={e => setFormData({ ...formData, requireManufactureDate: e.target.checked })}
                                                            disabled={isDisabled}
                                                        />
                                                        <label htmlFor="chkMfg">{t('require_mfg_date')}</label>
                                                    </div>
                                                    <div className="checkbox-group">
                                                        <input
                                                            type="checkbox"
                                                            id="chkExp"
                                                            checked={formData.requireExpirationDate}
                                                            onChange={e => setFormData({ ...formData, requireExpirationDate: e.target.checked })}
                                                            disabled={isDisabled}
                                                        />
                                                        <label htmlFor="chkExp">{t('require_exp_date')}</label>
                                                    </div>
                                                </div>
                                            )}

                                            {activeSubTab === 'hazardous' && (
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
                                                                    placeholder={t('un_number')}
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
                                                                    placeholder={t('hazard_class')}
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
                                                                    placeholder={t('packing_group')}
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

                                            {activeSubTab === 'replenishment' && (
                                                <div className="item-form-grid">
                                                    <div className="form-group">
                                                        <label>{t('min_qty')}</label>
                                                        <input
                                                            type="number"
                                                            value={formData.minQty}
                                                            onChange={e => setFormData({ ...formData, minQty: e.target.value })}
                                                            disabled={isDisabled}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('max_qty')}</label>
                                                        <input
                                                            type="number"
                                                            value={formData.maxQty}
                                                            onChange={e => setFormData({ ...formData, maxQty: e.target.value })}
                                                            disabled={isDisabled}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('pick_location')}</label>
                                                        <input
                                                            type="text"
                                                            value={formData.pickLocation}
                                                            onChange={e => setFormData({ ...formData, pickLocation: e.target.value })}
                                                            disabled={isDisabled}
                                                            maxLength={20}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {activeSubTab === 'logistics' && (
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

                                            {['shipping', 'labeling', 'handling'].includes(activeSubTab) && (
                                                <div className="placeholder-content" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                                                    <p style={{ color: 'var(--text-muted)' }}>
                                                        {t('feature_phase_3', { feature: t(activeSubTab) })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeTab === 'storage' && (
                                    <div className="item-form-grid">
                                        <div className="form-group">
                                            <label>{t('ti')}</label>
                                            <input
                                                type="number"
                                                value={formData.ti}
                                                onChange={e => setFormData({ ...formData, ti: e.target.value })}
                                                disabled={isDisabled}
                                                placeholder={t('cases_per_layer')}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('hi')}</label>
                                            <input
                                                type="number"
                                                value={formData.hi}
                                                onChange={e => setFormData({ ...formData, hi: e.target.value })}
                                                disabled={isDisabled}
                                                placeholder={t('layers_per_pallet')}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'aliases' && (
                                    <>
                                        {isEditing ? (
                                            <ItemAliases itemId={formData.id} customerId={formData.customerId} />
                                        ) : (
                                            <div className="placeholder-content" style={{ padding: '3rem', textAlign: 'center' }}>
                                                <p>{t('save_to_add_aliases', 'Please save the item first to add aliases.')}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab !== 'item' && activeTab !== 'storage' && activeTab !== 'aliases' && (
                                    <div className="placeholder-content" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                                        <h3>{t(activeTab)}</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>
                                            {t('main_tab_placeholder', { tab: t(activeTab) })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions" style={{ marginTop: '2rem' }}>
                                {!isDisabled && (
                                    <Button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={isEditing && !hasPermission("ITEM_UPDATE")}
                                    >
                                        {isEditing ? t('update') : t('create')}
                                    </Button>
                                )}
                                {(isEditing || formData.sku) && (
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

            <GlassCard title={`${t('items')} (${filteredItems.length})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('sku')}</th>
                                <th>{t('description')}</th>
                                <th>{t('customer')}</th>
                                <th>{t('uom')}</th>
                                <th>{t('item_group')}</th>
                                <th>{t('weight')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.sku}</td>
                                    <td>{item.description}</td>
                                    <td>{customers.find(c => c.id === item.customerId)?.name || item.customerId}</td>
                                    <td>{item.baseUOM}</td>
                                    <td>{itemGroups.find(g => g.id === item.itemGroupId)?.description || item.itemGroupId}</td>
                                    <td>{item.weight}</td>
                                    <td>{item.status === 'A' ? t('active') : t('inactive')}</td>
                                    <td className="actions">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleEdit(item)}
                                            className="btn-edit"
                                        >
                                            {hasPermission("ITEM_UPDATE") ? t('edit') : t('view')}
                                        </Button>
                                        <PermissionGate permission="ITEM_UPDATE">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(item.id, item.customerId)}
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


