import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import GlassCard from '../components/GlassCard'
import EntitySelector from '../components/EntitySelector'
import '../styles/master-data.css'

export default function ItemGroups() {
    const { t } = useTranslation()
    const init = { id: '', description: '', category: '', customerId: '' }
    const [items, setItems] = useState([])
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(localStorage.getItem('selectedCustomer') || '')
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    useEffect(() => {
        fetchItems()
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

    const filteredItems = selectedCustomer
        ? items.filter(item => item.customerId === selectedCustomer)
        : items

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/ItemGroup')
            setItems(res.data)
        } catch (err) {
            setError(t('error_fetch', { item: t('item_groups') }))
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
        const url = isEditing ? `http://localhost:5017/api/ItemGroup/${formData.id}` : 'http://localhost:5017/api/ItemGroup'
        try {
            await axios({
                method,
                url,
                data: formData
            })
            setSuccessMsg(isEditing ? t('success_updated', { item: t('item_group') }) : t('success_created', { item: t('item_group') }))
            setError(null)
            setIsEditing(false)
            setFormData(init)
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
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
            await axios.delete(`http://localhost:5017/api/ItemGroup/${id}`)
            setSuccessMsg(t('success_deleted', { item: t('item_group') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
        }
    }

    return (
        <div className="master-data-page">
            <h1>{t('item_groups')}</h1>

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
                    <input type="text" placeholder={`${t('id')} *`} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required disabled={isEditing} />
                    <input type="text" placeholder={t('description')} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
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
                    <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">{isEditing ? t('update') : t('create')}</button>
                        {isEditing && <button type="button" onClick={() => { setFormData(init); setIsEditing(false) }} className="btn-secondary">{t('cancel')}</button>}
                    </div>
                </form>
            </GlassCard>

            <GlassCard title={`${t('item_groups')} (${filteredItems.length})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr><th>{t('id')}</th><th>{t('description')}</th><th>{t('customer')}</th><th>Category</th><th>{t('actions')}</th></tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.description}</td>
                                    <td>{customers.find(c => c.id === item.customerId)?.name || item.customerId}</td>
                                    <td>{item.category}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEdit(item)} className="btn-edit">{t('edit')}</button>
                                        <button onClick={() => handleDelete(item.id)} className="btn-delete">{t('delete')}</button>
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
