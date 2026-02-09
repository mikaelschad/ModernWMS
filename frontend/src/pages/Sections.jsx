import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useFacility } from '../contexts/FacilityContext'
import GlassCard from '../components/GlassCard'
import '../styles/master-data.css'

export default function Sections() {
    const { t } = useTranslation()
    const { currentFacility } = useFacility()
    const init = { id: '', facilityId: currentFacility?.id || '', description: '', status: 'A' }
    const [items, setItems] = useState([])
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    useEffect(() => {
        fetchItems()
    }, [])

    useEffect(() => {
        if (currentFacility && !isEditing) {
            setFormData(prev => ({ ...prev, facilityId: currentFacility.id }))
        }
    }, [currentFacility, isEditing])

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5017/api/Section')
            setItems(res.data)
        } catch (err) {
            setError(t('error_fetch', { item: t('sections') }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `http://localhost:5017/api/Section/${formData.id}` : 'http://localhost:5017/api/Section'
        try {
            await axios({
                method,
                url,
                data: formData
            })
            setSuccessMsg(isEditing ? t('success_updated', { item: t('section') }) : t('success_created', { item: t('section') }))
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
            await axios.delete(`http://localhost:5017/api/Section/${id}`)
            setSuccessMsg(t('success_deleted', { item: t('section') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
        }
    }

    return (
        <div className="master-data-page">
            <h1>{t('sections')}</h1>

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
                        placeholder={`${t('facility')} *`}
                        value={formData.facilityId}
                        onChange={e => setFormData({ ...formData, facilityId: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('description')}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
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

            <GlassCard title={`${t('sections')} (${items.length})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('facility')}</th>
                                <th>{t('description')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.facilityId}</td>
                                    <td>{item.description}</td>
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
