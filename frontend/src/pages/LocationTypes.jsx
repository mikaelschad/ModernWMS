import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import GlassCard from '../components/GlassCard'
import Button from '../components/common/Button'
import PermissionGate from '../components/common/PermissionGate'
import '../styles/master-data.css'
import { API_ENDPOINTS } from '../config/api'

export default function LocationTypes() {
    const { t } = useTranslation()
    const init = { id: '', description: '', status: 'A' }
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
            const res = await axios.get(API_ENDPOINTS.LOCATION_TYPES)
            setItems(res.data)
        } catch (err) {
            setError(t('error_fetch', { item: t('location_types') }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `${API_ENDPOINTS.LOCATION_TYPES}/${formData.id}` : API_ENDPOINTS.LOCATION_TYPES

        try {
            await axios({
                method,
                url,
                data: formData
            })
            setSuccessMsg(isEditing ? t('success_updated', { item: t('location_type') }) : t('success_created', { item: t('location_type') }))
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
            await axios.delete(`${API_ENDPOINTS.LOCATION_TYPES}/${id}`)
            setSuccessMsg(t('success_deleted', { item: t('location_type') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
        }
    }

    return (
        <div className="master-data-page">
            <header className="page-header">
                <h2>{t('location_types', 'Location Types')}</h2>
                <p>{t('location_types_desc', 'Manage types of locations in your warehouse')}</p>
            </header>

            {error && <div className="error-msg">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            <PermissionGate permission={isEditing ? "LOCATION_UPDATE" : "LOCATION_CREATE"}>
                <GlassCard title={isEditing ? t('edit') : t('create')}>
                    <form onSubmit={handleSubmit} className="master-form">
                        <div className="form-group">
                            <label>{t('id')}</label>
                            <input
                                type="text"
                                placeholder={`${t('id')} *`}
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                required
                                disabled={isEditing}
                                maxLength={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('description')}</label>
                            <input
                                type="text"
                                placeholder={t('description')}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                maxLength={100}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('status')}</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="A">{t('active')}</option>
                                <option value="I">{t('inactive')}</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <Button type="submit">{isEditing ? t('update') : t('create')}</Button>
                            {isEditing && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setFormData(init)
                                        setIsEditing(false)
                                    }}
                                    variant="secondary"
                                >
                                    {t('cancel')}
                                </Button>
                            )}
                        </div>
                    </form>
                </GlassCard>
            </PermissionGate>

            <GlassCard title={`${t('location_types')} (${items.length})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('description')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.description}</td>
                                    <td>{item.status === 'A' ? t('active') : t('inactive')}</td>
                                    <td className="actions">
                                        <PermissionGate permission="LOCATION_UPDATE">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleEdit(item)}
                                            >
                                                {t('edit')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={['DMG', 'DOR', 'PND', 'PF', 'QC', 'RET', 'STG', 'STO'].includes(item.id)}
                                                title={['DMG', 'DOR', 'PND', 'PF', 'QC', 'RET', 'STG', 'STO'].includes(item.id) ? t('core_type_cannot_delete', 'Core System Type') : t('delete')}
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
