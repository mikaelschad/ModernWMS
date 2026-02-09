import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { useFacility } from '../contexts/FacilityContext'
import './PlateLookup.css' // Reusing existing styles for now

const LicensePlateForm = ({ plate, onSave, onCancel }) => {
    const { currentFacility } = useFacility()
    const isEditing = !!plate
    const initialForm = {
        id: '',
        sku: '',
        quantity: 0,
        unitOfMeasure: 'EA',
        location: '',
        status: 0, // Default to Active (enum 0)
        lotNumber: '',
        facilityId: currentFacility?.id || '',
        customerId: ''
    }

    const [formData, setFormData] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (plate) {
            setFormData({
                ...initialForm,
                ...plate,
                status: plate.status // Ensure status maps correctly
            })
        }
    }, [plate])

    const handleChange = (e) => {
        const { name, value, type } = e.target
        let val = value
        if (type === 'number') val = value === '' ? 0 : parseFloat(value)
        setFormData(prev => ({ ...prev, [name]: val }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await onSave(formData)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <GlassCard title={isEditing ? `Edit Plate: ${formData.id}` : "Create New License Plate"}>
                    {error && <div className="error-message">⚠ {error}</div>}

                    <form onSubmit={handleSubmit} className="plate-form-grid">
                        <div className="form-group">
                            <label>License Plate ID</label>
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                disabled={isEditing}
                                placeholder="LP-00001"
                                className="glass-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>SKU / Item</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="ITEM-001"
                                className="glass-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="glass-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>UOM</label>
                            <input
                                type="text"
                                name="unitOfMeasure"
                                value={formData.unitOfMeasure}
                                onChange={handleChange}
                                placeholder="EA"
                                className="glass-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="LOC-A-01"
                                className="glass-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="glass-input"
                            >
                                <option value={0}>Active</option>
                                <option value={1}>Hold</option>
                                <option value={2}>Consumed</option>
                                <option value={3}>Canceled</option>
                                <option value={4}>In Transit</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Facility</label>
                            <input
                                type="text"
                                name="facilityId"
                                value={formData.facilityId}
                                onChange={handleChange}
                                placeholder="FAC01"
                                className="glass-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Customer</label>
                            <input
                                type="text"
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                placeholder="CUST01"
                                className="glass-input"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Lot Number</label>
                            <input
                                type="text"
                                name="lotNumber"
                                value={formData.lotNumber || ''}
                                onChange={handleChange}
                                placeholder="LOT-2023-X"
                                className="glass-input"
                            />
                        </div>

                        <div className="form-actions-row full-width">
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Saving...' : (isEditing ? 'Update Plate' : 'Create Plate')}
                            </button>
                            <button type="button" onClick={onCancel} className="cancel-btn" disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    )
}

export default LicensePlateForm
