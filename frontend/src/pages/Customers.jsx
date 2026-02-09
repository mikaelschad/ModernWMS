import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import '../styles/master-data.css'

export default function Customers() {
    const { t } = useTranslation()
    const init = { id: '', name: '', address1: '', city: '', state: '', phone: '', email: '', status: 'A' }
    const [items, setItems] = useState([])
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await fetch('http://localhost:5017/api/Customer')
            if (res.ok) setItems(await res.json())
        } catch (err) {
            setError(t('error_fetch', { item: t('customers') }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `http://localhost:5017/api/Customer/${formData.id}` : 'http://localhost:5017/api/Customer'

        console.log('Submitting customer:', formData)
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

            setSuccessMsg(isEditing ? t('success_updated', { item: t('customer') }) : t('success_created', { item: t('customer') }))
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

    const handleDelete = async (id) => {
        if (!confirm(t('confirm_delete', { item: id }))) return

        try {
            const res = await fetch(`http://localhost:5017/api/Customer/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error(t('error_delete'))
            setSuccessMsg(t('success_deleted', { item: t('customer') }))
            fetchItems()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="master-data-page">
            <h1>{t('customers')}</h1>

            {error && <div className="error-msg">{error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            <GlassCard title={isEditing ? t('edit') : t('create')}>
                <form onSubmit={handleSubmit} className="master-form">
                    <input
                        type="text"
                        placeholder={`${t('id')} *`}
                        value={formData.id}
                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                        required
                        disabled={isEditing}
                    />
                    <input
                        type="text"
                        placeholder={`${t('name')} *`}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('address')}
                        value={formData.address1}
                        onChange={e => setFormData({ ...formData, address1: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder={t('city')}
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder={t('state')}
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder={t('phone')}
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder={t('email')}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                                    <td>{item.status === 'A' ? t('active') : t('inactive')}</td>
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
