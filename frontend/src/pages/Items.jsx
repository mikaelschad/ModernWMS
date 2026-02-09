import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import GlassCard from '../components/GlassCard'
import EntitySelector from '../components/EntitySelector'
import '../styles/master-data.css'
import './Items.css'

export default function Items() {
    const { t } = useTranslation()
    const init = {
        sku: '',
        description: '',
        abbreviation: '',
        unitOfMeasure: 'EA',
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
        status: 'A'
    }
    const [items, setItems] = useState([])
    const [customers, setCustomers] = useState([])
    const [itemGroups, setItemGroups] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(localStorage.getItem('selectedCustomer') || '')
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
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
        const url = isEditing ? `http://localhost:5017/api/Item/${formData.sku}` : 'http://localhost:5017/api/Item'

        console.log('Submitting item:', formData)
        console.log('URL:', url, 'Method:', method)

        try {
            const res = await axios({
                method,
                url,
                data: formData
            })

            console.log('Response status:', res.status)

            setSuccessMsg(isEditing ? t('success_updated', { item: t('item') }) : t('success_created', { item: t('item') }))
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

    const handleDelete = async (sku) => {
        if (!confirm(t('confirm_delete', { item: sku }))) return

        try {
            await axios.delete(`http://localhost:5017/api/Item/${sku}`)
            setSuccessMsg(t('success_deleted', { item: t('item') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
        }
    }

    return (
        <div className="master-data-page">
            <h1>{t('items')}</h1>

            {error && <div className="error-msg">{error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

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

            <GlassCard title={isEditing ? t('edit') : t('create')}>
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
                                                <input
                                                    type="text"
                                                    placeholder={`${t('sku')} *`}
                                                    value={formData.sku}
                                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                    required
                                                    disabled={isEditing}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={`${t('description')} *`}
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={t('abbreviation')}
                                                    value={formData.abbreviation}
                                                    onChange={e => setFormData({ ...formData, abbreviation: e.target.value })}
                                                />
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
                                                    disabled={!!selectedCustomer}
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
                                                    placeholder={t('select_item_group')}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={t('rate_group')}
                                                    value={formData.rateGroup}
                                                    onChange={e => setFormData({ ...formData, rateGroup: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={t('product_group')}
                                                    value={formData.productGroup}
                                                    onChange={e => setFormData({ ...formData, productGroup: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={t('kit_type')}
                                                    value={formData.kitType}
                                                    onChange={e => setFormData({ ...formData, kitType: e.target.value })}
                                                />
                                                <select
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="A">{t('active')}</option>
                                                    <option value="I">{t('inactive')}</option>
                                                </select>
                                            </div>
                                        )}

                                        {activeSubTab === 'uom' && (
                                            <div className="item-form-grid">
                                                <input
                                                    type="text"
                                                    placeholder={t('uom')}
                                                    value={formData.unitOfMeasure}
                                                    onChange={e => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        {activeSubTab === 'specs' && (
                                            <div className="item-form-grid">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={t('weight')}
                                                    value={formData.weight}
                                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={t('length')}
                                                    value={formData.length}
                                                    onChange={e => setFormData({ ...formData, length: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={t('width')}
                                                    value={formData.width}
                                                    onChange={e => setFormData({ ...formData, width: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={t('height')}
                                                    value={formData.height}
                                                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={t('volume')}
                                                    value={formData.volume}
                                                    onChange={e => setFormData({ ...formData, volume: e.target.value })}
                                                />
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
                                                    />
                                                    <label htmlFor="chkCycle">{t('require_cycle_count')}</label>
                                                </div>
                                                <div className="checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="chkLot"
                                                        checked={formData.requireLotNumber}
                                                        onChange={e => setFormData({ ...formData, requireLotNumber: e.target.checked })}
                                                    />
                                                    <label htmlFor="chkLot">{t('require_lot_number')}</label>
                                                </div>
                                                <div className="checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="chkSerial"
                                                        checked={formData.requireSerialNumber}
                                                        onChange={e => setFormData({ ...formData, requireSerialNumber: e.target.checked })}
                                                    />
                                                    <label htmlFor="chkSerial">{t('require_serial_number')}</label>
                                                </div>
                                                <div className="checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="chkMfg"
                                                        checked={formData.requireManufactureDate}
                                                        onChange={e => setFormData({ ...formData, requireManufactureDate: e.target.checked })}
                                                    />
                                                    <label htmlFor="chkMfg">{t('require_mfg_date')}</label>
                                                </div>
                                                <div className="checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="chkExp"
                                                        checked={formData.requireExpirationDate}
                                                        onChange={e => setFormData({ ...formData, requireExpirationDate: e.target.checked })}
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
                                                    />
                                                    <label htmlFor="chkHaz">{t('is_hazardous')}</label>
                                                </div>
                                                {formData.isHazardous && (
                                                    <>
                                                        <input
                                                            type="text"
                                                            placeholder={t('un_number')}
                                                            value={formData.unNumber}
                                                            onChange={e => setFormData({ ...formData, unNumber: e.target.value })}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={t('hazard_class')}
                                                            value={formData.hazardClass}
                                                            onChange={e => setFormData({ ...formData, hazardClass: e.target.value })}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={t('packing_group')}
                                                            value={formData.packingGroup}
                                                            onChange={e => setFormData({ ...formData, packingGroup: e.target.value })}
                                                        />
                                                    </>
                                                )}
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

                            {activeTab !== 'item' && (
                                <div className="placeholder-content" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                                    <h3>{t(activeTab)}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        {t('main_tab_placeholder', { tab: t(activeTab) })}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="form-actions" style={{ marginTop: '2rem' }}>
                            <button type="submit" className="btn-primary">
                                {isEditing ? t('update') : t('create')}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(init)
                                        setIsEditing(false)
                                    }}
                                    className="btn-secondary"
                                >
                                    {t('cancel')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </GlassCard>

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
                                <tr key={item.sku}>
                                    <td>{item.sku}</td>
                                    <td>{item.description}</td>
                                    <td>{customers.find(c => c.id === item.customerId)?.name || item.customerId}</td>
                                    <td>{item.unitOfMeasure}</td>
                                    <td>{itemGroups.find(g => g.id === item.itemGroupId)?.description || item.itemGroupId}</td>
                                    <td>{item.weight}</td>
                                    <td>{item.status === 'A' ? t('active') : t('inactive')}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEdit(item)} className="btn-edit">{t('edit')}</button>
                                        <button onClick={() => handleDelete(item.sku)} className="btn-delete">{t('delete')}</button>
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
