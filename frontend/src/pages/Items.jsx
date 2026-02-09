import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import EntitySelector from '../components/EntitySelector'
import '../styles/master-data.css'

export default function Items() {
    const { t } = useTranslation()
    const init = { sku: '', description: '', unitOfMeasure: 'EA', itemGroupId: '', customerId: '', weight: '', status: 'A' }
    const [items, setItems] = useState([])
    const [customers, setCustomers] = useState([])
    const [itemGroups, setItemGroups] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(localStorage.getItem('selectedCustomer') || '')
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

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
            const res = await fetch('http://localhost:5017/api/Item')
            if (res.ok) setItems(await res.json())
        } catch (err) {
            setError(t('error_fetch', { item: t('items') }))
        }
    }

    const fetchCustomers = async () => {
        try {
            const res = await fetch('http://localhost:5017/api/Customer')
            if (res.ok) setCustomers(await res.json())
        } catch (err) {
            console.error(err)
        }
    }

    const fetchItemGroups = async () => {
        try {
            const res = await fetch('http://localhost:5017/api/ItemGroup')
            if (res.ok) setItemGroups(await res.json())
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
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            console.log('Response status:', res.status)

            if (!res.ok) {
                const errorText = await res.text()
                console.error('Error response:', errorText)
                throw new Error(errorText || t('error_save'))
            }

            setSuccessMsg(isEditing ? t('success_updated', { item: t('item') }) : t('success_created', { item: t('item') }))
            setError(null)
            setIsEditing(false)
            setFormData(init)
            fetchItems()
        } catch (err) {
            console.error('Caught error:', err)
            setError(err.message)
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
            const res = await fetch(`http://localhost:5017/api/Item/${sku}`, { method: 'DELETE' })
            if (!res.ok) throw new Error(t('error_delete'))
            setSuccessMsg(t('success_deleted', { item: t('item') }))
            fetchItems()
        } catch (err) {
            setError(err.message)
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
                <form onSubmit={handleSubmit} className="master-form">
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
                        placeholder={t('uom')}
                        value={formData.unitOfMeasure}
                        onChange={e => setFormData({ ...formData, unitOfMeasure: e.target.value })}
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
                        type="number"
                        step="0.01"
                        placeholder={t('weight')}
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    />
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="A">{t('active')}</option>
                        <option value="I">{t('inactive')}</option>
                    </select>

                    <div className="form-actions">
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
