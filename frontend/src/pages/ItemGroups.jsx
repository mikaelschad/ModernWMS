import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
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
            const res = await fetch('http://localhost:5017/api/ItemGroup')
            if (res.ok) setItems(await res.json())
        } catch (err) {
            setError(t('error_fetch', { item: t('item_groups') }))
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `http://localhost:5017/api/ItemGroup/${formData.id}` : 'http://localhost:5017/api/ItemGroup'
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!res.ok) throw new Error(t('error_save'))
            setSuccessMsg(isEditing ? t('success_updated', { item: t('item_group') }) : t('success_created', { item: t('item_group') }))
            setError(null)
            setIsEditing(false)
            setFormData(init)
            fetchItems()
        } catch (err) {
            setError(err.message)
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
            const res = await fetch(`http://localhost:5017/api/ItemGroup/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error(t('error_delete'))
            setSuccessMsg(t('success_deleted', { item: t('item_group') }))
            fetchItems()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="master-data-page">
            <h1>{t('item_groups')}</h1>

            {error && <div className="error-msg">{error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            {/* Customer Filter */}
            <GlassCard title={t('select_customer')}>
                <select
                    value={selectedCustomer}
                    onChange={e => handleCustomerChange(e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                >
                    <option value="">{t('all_customers')}</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </GlassCard>

            <GlassCard title={isEditing ? t('edit') : t('create')}>
                <form onSubmit={handleSubmit} className="master-form">
                    <input type="text" placeholder={`${t('id')} *`} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required disabled={isEditing} />
                    <input type="text" placeholder={t('description')} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <select
                        value={formData.customerId}
                        onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                        className="form-select"
                        style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                        disabled={!!selectedCustomer}
                    >
                        <option value="">{t('select_customer')}</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
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
