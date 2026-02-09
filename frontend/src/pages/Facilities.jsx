import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import GlassCard from '../components/GlassCard'
import './Facilities.css'

const Facilities = () => {
    const { t } = useTranslation()
    const [facilities, setFacilities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [activeFormTab, setActiveFormTab] = useState('basic')

    const initialForm = {
        id: '',
        name: '',
        address1: '',
        city: '',
        state: '',
        status: 'A',
        manager: '',
        phone: '',
        email: '',
        remitName: '',
        remitAddress1: '',
        remitCity: '',
        taskLimit: 100,
        crossDockLocation: '',
        useLocationCheckdigit: 'N',
        restrictPutaway: 'N',
        workMondayIn: 'Y',
        workTuesdayIn: 'Y',
        workWednesdayIn: 'Y',
        workThursdayIn: 'Y',
        workFridayIn: 'Y',
        workSaturdayIn: 'N',
        workSundayIn: 'N'
    }

    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        fetchFacilities()
    }, [])

    const fetchFacilities = async () => {
        try {
            setLoading(true)
            const res = await axios.get('http://localhost:5017/api/Facility')
            setFacilities(res.data)
        } catch (err) {
            setError(err.response?.data || err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        let val = type === 'checkbox' ? (checked ? 'Y' : 'N') : value
        if (type === 'number') val = value === '' ? null : parseInt(value, 10)
        setFormData(prev => ({ ...prev, [name]: val }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing
            ? `http://localhost:5017/api/Facility/${formData.id}`
            : 'http://localhost:5017/api/Facility'

        try {
            await axios({
                method,
                url,
                data: formData
            })

            setSuccessMsg(isEditing ? t('success_updated', { item: t('facility') }) : t('success_created', { item: t('facility') }))
            setError(null); // Clear any previous errors
            setIsEditing(false)
            setFormData(initialForm)
            fetchFacilities()
        } catch (err) {
            setError(err.response?.data || err.message)
            setSuccessMsg(null); // Clear any previous success messages
        }
    }

    const handleEdit = (fac) => {
        setFormData(fac)
        setIsEditing(true)
        setActiveFormTab('basic')
        setError(null); // Clear messages on edit
        setSuccessMsg(null);
    }

    const handleDelete = async (id) => {
        if (!window.confirm(t('confirm_delete', { item: id }))) return
        try {
            await axios.delete(`http://localhost:5017/api/Facility/${id}`)
            setSuccessMsg(t('success_deleted', { item: t('facility') }))
            setError(null); // Clear any previous errors
            fetchFacilities()
        } catch (err) {
            setError(err.response?.data || err.message)
            setSuccessMsg(null); // Clear any previous success messages
        }
    }

    return (
        <div className="facilities-container">
            <header className="page-header">
                <h2>{t('facility_management')}</h2>
                <p>{t('facility_management_desc')}</p>
            </header>

            {error && <div className="error-message">⚠ {error}</div>}
            {successMsg && <div className="success-message">✅ {successMsg}</div>}

            <div className="facilities-grid-v2">
                <div className="form-section-wide">
                    <GlassCard title={isEditing ? `${t('edit')}: ${formData.id}` : t('initialize_facility')}>
                        <div className="tab-navigation">
                            <button className={activeFormTab === 'basic' ? 'active' : ''} onClick={() => setActiveFormTab('basic')}>{t('basic_info')}</button>
                            <button className={activeFormTab === 'setup' ? 'active' : ''} onClick={() => setActiveFormTab('setup')}>{t('advanced_setup')}</button>
                            <button className={activeFormTab === 'schedule' ? 'active' : ''} onClick={() => setActiveFormTab('schedule')}>{t('operations')}</button>
                        </div>

                        <form onSubmit={handleSubmit} className="facility-form-grid">
                            {activeFormTab === 'basic' && (
                                <div className="form-tab-content grid-2-col">
                                    <div className="form-group">
                                        <label>{t('id')} (Primary Key)</label>
                                        <input type="text" name="id" value={formData.id} onChange={handleInputChange} disabled={isEditing} placeholder="FAC01" className="glass-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('name')}</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('name')} className="glass-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('manager')}</label>
                                        <input type="text" name="manager" value={formData.manager} onChange={handleInputChange} placeholder={t('manager')} className="glass-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('status')}</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="glass-input">
                                            <option value="A">{t('active')}</option>
                                            <option value="I">{t('inactive')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('phone')}</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="glass-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('email')}</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="glass-input" />
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'setup' && (
                                <div className="form-tab-content grid-2-col">
                                    <div className="form-group">
                                        <label>{t('cross_dock_location')}</label>
                                        <input type="text" name="crossDockLocation" value={formData.crossDockLocation} onChange={handleInputChange} className="glass-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('task_limit')}</label>
                                        <input type="number" name="taskLimit" value={formData.taskLimit} onChange={handleInputChange} className="glass-input" />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input type="checkbox" name="useLocationCheckdigit" checked={formData.useLocationCheckdigit === 'Y'} onChange={handleInputChange} />
                                            {t('use_location_checkdigit')}
                                        </label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input type="checkbox" name="restrictPutaway" checked={formData.restrictPutaway === 'Y'} onChange={handleInputChange} />
                                            {t('restrict_putaway')}
                                        </label>
                                    </div>
                                    <div className="form-group full-width separator">
                                        <label>{t('remit_to_info')}</label>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('remit_name')}</label>
                                        <input type="text" name="remitName" value={formData.remitName} onChange={handleInputChange} className="glass-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('remit_address')}</label>
                                        <input type="text" name="remitAddress1" value={formData.remitAddress1} onChange={handleInputChange} className="glass-input" />
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'schedule' && (
                                <div className="form-tab-content">
                                    <label className="section-label">{t('active_work_days')}</label>
                                    <div className="days-grid">
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                            <div key={day} className="day-check">
                                                <input
                                                    type="checkbox"
                                                    name={`work${day}In`}
                                                    checked={formData[`work${day}In`] === 'Y'}
                                                    onChange={handleInputChange}
                                                />
                                                <span>{t(day)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-actions-row">
                                <button type="submit" className="submit-btn">{isEditing ? t('save_changes') : t('initialize_facility')}</button>
                                {isEditing && (
                                    <button type="button" onClick={() => { setIsEditing(false); setFormData(initialForm) }} className="cancel-btn">{t('cancel')}</button>
                                )}
                            </div>
                        </form>
                    </GlassCard>
                </div>

                <div className="list-section-wide">
                    <GlassCard title={t('synapse_network')}>
                        <div className="scrollable-table">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>{t('id')}</th>
                                        <th>{t('name')}</th>
                                        <th>{t('manager')}</th>
                                        <th>{t('task_limit')}</th>
                                        <th>{t('status')}</th>
                                        <th>{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facilities.map(fac => (
                                        <tr key={fac.id}>
                                            <td>{fac.id}</td>
                                            <td>{fac.name}</td>
                                            <td>{fac.manager || '-'}</td>
                                            <td>{fac.taskLimit}</td>
                                            <td>
                                                <span className={`status-badge-small ${fac.status === 'A' ? 'active' : 'inactive'}`}>
                                                    {fac.status === 'A' ? t('active').toUpperCase() : t('inactive').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <button onClick={() => handleEdit(fac)} className="edit-btn">{t('edit')}</button>
                                                <button onClick={() => handleDelete(fac.id)} className="delete-btn">{t('delete')}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

export default Facilities
