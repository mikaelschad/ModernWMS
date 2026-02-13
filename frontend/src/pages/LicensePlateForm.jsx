import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

    const [customerRules, setCustomerRules] = useState(null)

    useEffect(() => {
        if (plate) {
            setFormData({
                ...initialForm,
                ...plate,
                status: plate.status,
                // Ensure dates are formatted for input type="date"
                manufactureDate: plate.manufactureDate ? plate.manufactureDate.split('T')[0] : '',
                expirationDate: plate.expirationDate ? plate.expirationDate.split('T')[0] : ''
            })
        }
    }, [plate])

    // Fetch customer rules when customer changes
    useEffect(() => {
        if (formData.customerId) {
            axios.get(`http://localhost:5017/api/Customer/${formData.customerId}`)
                .then(res => setCustomerRules(res.data))
                .catch(() => setCustomerRules(null)) // Ignore errors or clear rules
        } else {
            setCustomerRules(null)
        }
    }, [formData.customerId])

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

        // --- Client-Side Validation ---
        if (customerRules) {
            if (customerRules.receiveRule_RequireExpDate && !formData.expirationDate) {
                setError(`Expiration Date is required for customer ${formData.customerId}`)
                setLoading(false)
                return
            }
            if (customerRules.receiveRule_RequireMfgDate && !formData.manufactureDate) {
                setError(`Manufacture Date is required for customer ${formData.customerId}`)
                setLoading(false)
                return
            }
            if (customerRules.receiveRule_LotValidationRegex && formData.lotNumber) {
                try {
                    const regex = new RegExp(customerRules.receiveRule_LotValidationRegex)
                    if (!regex.test(formData.lotNumber)) {
                        setError(`Lot Number does not match required pattern: ${customerRules.receiveRule_LotValidationRegex}`)
                        setLoading(false)
                        return
                    }
                } catch (e) {
                    console.error("Invalid Regex in Customer Rule", e)
                }
            }
            if (customerRules.receiveRule_SerialValidationRegex && formData.serialNumber) {
                try {
                    const regex = new RegExp(customerRules.receiveRule_SerialValidationRegex)
                    if (!regex.test(formData.serialNumber)) {
                        setError(`Serial Number does not match required pattern: ${customerRules.receiveRule_SerialValidationRegex}`)
                        setLoading(false)
                        return
                    }
                } catch (e) {
                    console.error("Invalid Regex in Customer Rule", e)
                }
            }
        }
        // -----------------------------

        try {
            await onSave(formData)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return createPortal(
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
                                maxLength={50}
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
                                maxLength={50}
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
                                maxLength={10}
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
                                maxLength={20}
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
                                maxLength={20}
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
                                maxLength={30}
                            />
                        </div>

                        <div className="form-group">
                            <label>Lot Number {customerRules?.receiveRule_LotValidationRegex && '*'}</label>
                            <input
                                type="text"
                                name="lotNumber"
                                value={formData.lotNumber || ''}
                                onChange={handleChange}
                                placeholder={customerRules?.receiveRule_LotValidationRegex ? `Regex: ${customerRules.receiveRule_LotValidationRegex}` : "LOT-2023-X"}
                                className="glass-input"
                                maxLength={50}
                                required={!!customerRules?.receiveRule_LotValidationRegex}
                            />
                            {customerRules?.receiveRule_LotValidationRegex && (
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                    Matches: {customerRules.receiveRule_LotValidationRegex}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Serial Number {customerRules?.receiveRule_SerialValidationRegex && '*'}</label>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber || ''}
                                onChange={handleChange}
                                placeholder="SN-12345"
                                className="glass-input"
                                maxLength={50}
                                required={!!customerRules?.receiveRule_SerialValidationRegex}
                            />
                        </div>

                        <div className="form-group">
                            <label>Manufacture Date {customerRules?.receiveRule_RequireMfgDate && '*'}</label>
                            <input
                                type="date"
                                name="manufactureDate"
                                value={formData.manufactureDate || ''}
                                onChange={handleChange}
                                className="glass-input"
                                required={!!customerRules?.receiveRule_RequireMfgDate}
                            />
                        </div>

                        <div className="form-group">
                            <label>Expiration Date {customerRules?.receiveRule_RequireExpDate && '*'}</label>
                            <input
                                type="date"
                                name="expirationDate"
                                value={formData.expirationDate || ''}
                                onChange={handleChange}
                                className="glass-input"
                                required={!!customerRules?.receiveRule_RequireExpDate}
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
        </div>,
        document.body
    )
}

export default LicensePlateForm
