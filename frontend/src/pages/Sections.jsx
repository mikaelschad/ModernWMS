import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useFacility } from '../contexts/FacilityContext'
import GlassCard from '../components/GlassCard'
import Button from '../components/common/Button'
import PermissionGate from '../components/common/PermissionGate'
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
            setError(err.response?.data?.message || err.response?.data || err.message)
            setSuccessMsg(null)
        }
    }

    const handleEdit = (item) => {
        setFormData(item)
        setIsEditing(true)
    }

    const handleDelete = async (id, facilityId) => {
        if (!confirm(t('confirm_delete', { item: id }))) return
        try {
            await axios.delete(`http://localhost:5017/api/Section/${id}`, { params: { facilityId } })
            setSuccessMsg(t('success_deleted', { item: t('section') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || err.message)
        }
    }

    const filteredItems = currentFacility
        ? items.filter(item => item.facilityId === currentFacility.id)
        : items



    return (
        <div className="master-data-page">
            <header className="page-header">
                <h2>{t('sections')}</h2>
                <p>{t('sections_desc', 'Manage your warehouse sections')}</p>
            </header>

            {error && <div className="error-msg">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            <PermissionGate permission={isEditing ? "SECTION_UPDATE" : "SECTION_CREATE"}>
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
                                maxLength={20}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('facility')}</label>
                            <input
                                type="text"
                                placeholder={`${t('facility')} *`}
                                value={formData.facilityId}
                                onChange={e => setFormData({ ...formData, facilityId: e.target.value })}
                                required
                                disabled // Always disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('description')}</label>
                            <input
                                type="text"
                                placeholder={t('description')}
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                            <Button type="submit">
                                {isEditing ? t('update') : t('create')}
                            </Button>
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

            <GlassCard title={`${t('sections')} (${filteredItems.length})`}>
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
                            {filteredItems.map(item => (
                                <tr key={`${item.id}-${item.facilityId}`}>
                                    <td>{item.id}</td>
                                    <td>{item.facilityId}</td>

                                    <td>{item.description}</td>
                                    <td>{item.status === 'A' ? t('active') : t('inactive')}</td>
                                    <td className="actions">
                                        <PermissionGate permission="SECTION_UPDATE">
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
                                                onClick={() => handleDelete(item.id, item.facilityId)}
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
