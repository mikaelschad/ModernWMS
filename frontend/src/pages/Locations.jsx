import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useFacility } from '../contexts/FacilityContext'
import GlassCard from '../components/GlassCard'
import Button from '../components/common/Button'
import PermissionGate from '../components/common/PermissionGate'
import '../styles/master-data.css'
import { API_ENDPOINTS } from '../config/api'

export default function Locations() {
    const { t } = useTranslation()
    const { currentFacility } = useFacility()
    const init = { id: '', facilityId: currentFacility?.id || '', zoneId: '', sectionId: '', locationType: '', status: 'A' }
    const [items, setItems] = useState([])
    const [zones, setZones] = useState([])
    const [sections, setSections] = useState([])
    const [locationTypes, setLocationTypes] = useState([])
    const [formData, setFormData] = useState(init)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [total, setTotal] = useState(0)

    const fetchLocationTypes = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.LOCATION_TYPES)
            setLocationTypes(res.data)
        } catch (err) {
            console.error('Error fetching location types', err)
        }
    }

    const fetchItems = async () => {
        if (!currentFacility) return
        try {
            const res = await axios.get(`${API_ENDPOINTS.LOCATIONS}?page=${page}&pageSize=${pageSize}&facilityId=${currentFacility.id}`)
            setItems(res.data.data)
            setTotal(res.data.total)
        } catch (err) {
            setError(t('error_fetch', { item: t('locations') }))
        }
    }

    const fetchZones = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.ZONES)
            setZones(res.data)
        } catch (err) {
            console.error('Error fetching zones', err)
        }
    }

    const fetchSections = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.SECTIONS)
            setSections(res.data)
        } catch (err) {
            console.error('Error fetching sections', err)
        }
    }

    useEffect(() => {
        if (currentFacility) setPage(1)
    }, [currentFacility])

    useEffect(() => {
        if (currentFacility) {
            fetchItems()
            fetchZones()
            fetchSections()
            fetchLocationTypes()
        }
    }, [page, currentFacility])

    useEffect(() => {
        if (currentFacility && !isEditing) setFormData(prev => ({ ...prev, facilityId: currentFacility.id }))
    }, [currentFacility])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ? `${API_ENDPOINTS.LOCATIONS}/${formData.id}` : API_ENDPOINTS.LOCATIONS

        try {
            await axios({
                method,
                url,
                data: formData
            })
            setSuccessMsg(isEditing ? t('success_updated', { item: t('location') }) : t('success_created', { item: t('location') }))
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
            await axios.delete(`${API_ENDPOINTS.LOCATIONS}/${id}`)
            setSuccessMsg(t('success_deleted', { item: t('location') }))
            fetchItems()
        } catch (err) {
            setError(err.response?.data || err.message)
        }
    }

    const filteredZones = currentFacility
        ? zones.filter(z => z.facilityId === currentFacility.id)
        : zones

    const filteredSections = currentFacility
        ? sections.filter(s => s.facilityId === currentFacility.id)
        : sections

    return (
        <div className="master-data-page">
            <header className="page-header">
                <h2>{t('locations')}</h2>
                <p>{t('locations_desc', 'Manage your warehouse locations')}</p>
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
                            <label>{t('zone')}</label>
                            <select
                                value={formData.zoneId || ''}
                                onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
                            >
                                <option value="">-- {t('select_zone')} --</option>
                                {filteredZones.map(z => (
                                    <option key={`${z.id}-${z.facilityId}`} value={z.id}>
                                        {z.id} - {z.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('section')}</label>
                            <select
                                value={formData.sectionId || ''}
                                onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                            >
                                <option value="">-- {t('select_section')} --</option>
                                {filteredSections
                                    .map(s => (
                                        <option key={`${s.id}-${s.facilityId}`} value={s.id}>
                                            {s.id} - {s.description}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('type')}</label>
                            <select
                                value={formData.locationType || ''}
                                onChange={e => setFormData({ ...formData, locationType: e.target.value })}
                            >
                                <option value="">-- {t('select_type', 'Select Type')} --</option>
                                {locationTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.description}</option>
                                ))}
                            </select>
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

            <GlassCard title={`${t('locations')} (${total})`}>
                <div className="master-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('facility')}</th>
                                <th>{t('zone')}</th>
                                <th>{t('section')}</th>
                                <th>{t('type')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.facilityId}</td>
                                    <td>{item.zoneId}</td>
                                    <td>{item.sectionId}</td>
                                    <td>{item.locationType}</td>
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

            <div className="pagination-controls" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="secondary"
                >
                    {t('previous')}
                </Button>
                <span>{t('page')} {page} {t('of')} {Math.ceil(total / pageSize)}</span>
                <Button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / pageSize)}
                    variant="secondary"
                >
                    {t('next')}
                </Button>
            </div>
        </div>
    )
}
