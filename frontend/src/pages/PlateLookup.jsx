import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import GlassCard from '../components/GlassCard'
import LicensePlateForm from './LicensePlateForm'
import { useFacility } from '../contexts/FacilityContext'
import './PlateLookup.css'

const PlateLookup = () => {
  const { t } = useTranslation()
  const { currentFacility } = useFacility()
  const [criteria, setCriteria] = useState({
    lpid: '',
    sku: '',
    customerId: '',
    facilityId: '',
    location: '',
    lotNumber: '',
    status: '',
    limit: '100'
  })

  // Auto-populate facility when context changes
  useEffect(() => {
    if (currentFacility) {
      setCriteria(prev => ({ ...prev, facilityId: currentFacility.id }))
    }
  }, [currentFacility])
  const [results, setResults] = useState([])
  const [customers, setCustomers] = useState([])
  const [facilities, setFacilities] = useState([])
  const [selectedPlate, setSelectedPlate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [moving, setMoving] = useState(false)

  // CRUD State
  const [showForm, setShowForm] = useState(false)
  const [editingPlate, setEditingPlate] = useState(null)

  // Sorting State
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [custRes, facRes] = await Promise.all([
          axios.get('http://localhost:5017/api/LicensePlate/customers?onlyActive=true'),
          axios.get('http://localhost:5017/api/LicensePlate/facilities?onlyActive=true')
        ])
        setCustomers(custRes.data)
        setFacilities(facRes.data)
      } catch (err) {
        console.error('Failed to fetch search metadata:', err)
      }
    }
    fetchMetadata()
  }, [])

  const handleSearch = async (e) => {
    if (e) e.preventDefault()

    const params = new URLSearchParams()
    if (criteria.lpid) params.append('LPID', criteria.lpid)
    if (criteria.sku) params.append('SKU', criteria.sku)
    if (criteria.customerId) params.append('CustomerId', criteria.customerId)
    if (criteria.facilityId) params.append('FacilityId', criteria.facilityId)
    if (criteria.location) params.append('Location', criteria.location)
    if (criteria.lotNumber) params.append('LotNumber', criteria.lotNumber)
    if (criteria.status) params.append('Status', criteria.status)
    if (criteria.limit && criteria.limit !== 'ALL') params.append('Limit', criteria.limit)

    if (params.toString() === '' || params.toString() === `Limit=${criteria.limit}`) {
      // Prevent empty search unless only limit is set (allow searching with just limit if user wants)
      if (params.toString() === '') return;
    }

    setLoading(true)
    setError(null)
    setResults([])
    setSelectedPlate(null)

    try {
      const response = await axios.get(`http://localhost:5017/api/LicensePlate/search?${params.toString()}`)
      const data = response.data
      setResults(data)

      if (data.length === 1) {
        setSelectedPlate(data[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteAI = async () => {
    if (!selectedPlate) return

    setMoving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await axios.post('http://localhost:5017/api/LicensePlate/move', {
        plateId: selectedPlate.id,
        targetLocation: 'ZONE-A-01', // This should normally come from the AI suggested logic
        user: 'AI_SYSTEM'
      })



      setSuccessMsg(t('success_updated', { item: `${t('plate')} ${selectedPlate.id}` }))

      // Update local state to reflect the move
      setResults(prev => prev.map(p => p.id === selectedPlate.id ? { ...p, location: 'ZONE-A-01', lastUpdate: new Date().toISOString() } : p))
      setSelectedPlate(prev => ({ ...prev, location: 'ZONE-A-01', lastUpdate: new Date().toISOString() }))

    } catch (err) {
      setError(err.message)
    } finally {
      setMoving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCriteria(prev => ({ ...prev, [name]: value }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return '#4ade80' // Active
      case 1: return '#fbbf24' // Hold
      case 2: return '#94a3b8' // Consumed
      case 3: return '#f87171' // Canceled
      case 4: return '#60a5fa' // In Transit
      default: return '#f87171' // Error
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 0: return t('active').toUpperCase()
      case 1: return 'ON HOLD' // TODO: Translate
      case 2: return 'CONSUMED' // TODO: Translate
      case 3: return 'CANCELED' // TODO: Translate
      case 4: return 'IN TRANSIT' // TODO: Translate
      default: return 'UNKNOWN'
    }
  }

  const handleEdit = (plate) => {
    setEditingPlate(plate)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete', { item: id }))) return

    try {
      await axios.delete(`http://localhost:5017/api/LicensePlate/${id}`)

      setSuccessMsg(t('success_deleted', { item: t('plate') }))
      setSelectedPlate(null)
      setResults(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async (plateData) => {
    const isNew = !editingPlate
    const url = isNew
      ? 'http://localhost:5017/api/LicensePlate'
      : `http://localhost:5017/api/LicensePlate/${plateData.id}`

    const method = isNew ? 'POST' : 'PUT'

    const response = await axios({
      method,
      url,
      data: plateData
    })

    setShowForm(false)
    setEditingPlate(null)
    setSuccessMsg(isNew ? t('success_created', { item: t('plate') }) : t('success_updated', { item: t('plate') }))

    // Refresh current search if applicable, or just update local state if simple
    if (isNew) {
      // improvements: auto-search for the new plate or add to results
      setResults(prev => [...prev, plateData])
      setSelectedPlate(plateData)
    } else {
      setResults(prev => prev.map(p => p.id === plateData.id ? { ...p, ...plateData } : p))
      setSelectedPlate(prev => ({ ...prev, ...plateData }))
    }
  }

  // Sorting handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    if (!sortColumn) return 0

    let aVal = a[sortColumn]
    let bVal = b[sortColumn]

    // Handle numeric sorting for quantity
    if (sortColumn === 'quantity') {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    } else {
      // String sorting (case insensitive)
      aVal = String(aVal || '').toLowerCase()
      bVal = String(bVal || '').toLowerCase()
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Calculate statistics
  const totalQuantity = results.reduce((sum, plate) => sum + (parseFloat(plate.quantity) || 0), 0)

  // Export to CSV
  const exportToCSV = () => {
    if (results.length === 0) return

    const headers = ['LPID', 'SKU', 'Quantity', 'UOM', 'Location', 'Facility', 'Customer', 'Status', 'Last Update']
    const rows = results.map(plate => [
      plate.id,
      plate.sku,
      plate.quantity,
      plate.unitOfMeasure,
      plate.location,
      plate.facilityId,
      plate.customerId,
      getStatusText(plate.status),
      new Date(plate.lastUpdate).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '')

    link.setAttribute('href', url)
    link.setAttribute('download', `license_plates_export_${date}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="plate-lookup-container">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h2>{t('license_plate_search')}</h2>
            <p>{t('plate_search_desc')}</p>
          </div>
          <button className="create-btn" onClick={() => { setEditingPlate(null); setShowForm(true); }}>
            + {t('new_license_plate')}
          </button>
        </div>
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-grid-large">
          <div className="search-field">
            <label>{t('plate')}</label>
            <input
              type="text"
              name="lpid"
              placeholder={t('contains_id')}
              value={criteria.lpid}
              onChange={handleInputChange}
              className="glass-input"
            />
          </div>
          <div className="search-field">
            <label>{t('sku')} / {t('item')}</label>
            <input
              type="text"
              name="sku"
              placeholder={t('contains_sku')}
              value={criteria.sku}
              onChange={handleInputChange}
              className="glass-input"
            />
          </div>
          <div className="search-field">
            <label>{t('customer')}</label>
            <select
              name="customerId"
              value={criteria.customerId}
              onChange={handleInputChange}
              className="glass-input"
            >
              <option value="">{t('all_customers')}</option>
              {customers?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="search-field">
            <label>{t('facility')}</label>
            <select
              name="facilityId"
              value={criteria.facilityId}
              onChange={handleInputChange}
              className="glass-input"
            >
              <option value="">{t('all_facilities')}</option>
              {facilities?.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="search-field">
            <label>{t('location')}</label>
            <input
              type="text"
              name="location"
              placeholder={t('contains_location')}
              value={criteria.location}
              onChange={handleInputChange}
              className="glass-input"
            />
          </div>
          <div className="search-field">
            <label>Lot Number</label>
            <input
              type="text"
              name="lotNumber"
              placeholder={t('contains_lot')}
              value={criteria.lotNumber}
              onChange={handleInputChange}
              className="glass-input"
            />
          </div>
          <div className="search-field">
            <label>{t('status')}</label>
            <select
              name="status"
              value={criteria.status}
              onChange={handleInputChange}
              className="glass-input"
            >
              <option value="">{t('any_status')}</option>
              <option value="A">{t('active')}</option>
              <option value="H">Hold</option>
              <option value="C">Consumed</option>
              <option value="X">Canceled</option>
            </select>
          </div>
          <div className="search-field">
            <label>{t('top_results')}</label>
            <select
              name="limit"
              value={criteria.limit}
              onChange={handleInputChange}
              className="glass-input"
            >
              <option value="10">10 Results</option>
              <option value="100">100 Results</option>
              <option value="1000">1,000 Results</option>
              <option value="5000">5,000 Results</option>
              <option value="ALL">ALL (Caution)</option>
            </select>
          </div>
          <div className="search-field action-field">
            <button type="submit" disabled={loading} className="search-button-full">
              {loading ? t('searching') : t('search_inventory')}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {successMsg && (
        <div className="success-message">
          ✅ {successMsg}
        </div>
      )}

      {!loading && !selectedPlate && results && results.length === 0 && (criteria.lpid || criteria.sku || criteria.customerId) && (
        <div className="no-results">
          {t('no_results')}
        </div>
      )}

      {results.length > 0 && !selectedPlate && (
        <div className="results-section">
          <div className="results-header">
            <div className="results-stats">
              <span className="result-count">{t('plates_found', { count: results.length })}</span>
              <span className="total-qty">{t('total_qty')}: {totalQuantity.toFixed(2)}</span>
            </div>
            <button className="export-btn" onClick={exportToCSV}>
              📥 {t('export_csv')}
            </button>
          </div>

          <div className="scrollable-table">
            <table className="results-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="sortable">
                    LPID {sortColumn === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('sku')} className="sortable">
                    {t('sku')} {sortColumn === 'sku' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('quantity')} className="sortable">
                    {t('quantity')} {sortColumn === 'quantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('location')} className="sortable">
                    {t('location')} {sortColumn === 'location' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('facilityId')} className="sortable">
                    {t('facility')} {sortColumn === 'facilityId' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    {t('status')} {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map(plate => (
                  <tr key={plate.id}>
                    <td className="id-cell">{plate.id}</td>
                    <td>{plate.sku}</td>
                    <td className="qty-cell">{plate.quantity} {plate.unitOfMeasure}</td>
                    <td className="loc-cell">{plate.location}</td>
                    <td>{plate.facilityId}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(plate.status) }}
                      >
                        {getStatusText(plate.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedPlate(plate)}
                      >
                        {t('view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPlate ? (
        <div className="plate-results-grid">
          <div className="main-info">
            <button className="back-btn" onClick={() => setSelectedPlate(null)}>← {t('back_to_results')}</button>
            <GlassCard title={`${t('plate')}: ${selectedPlate.id}`}>
              <div className="plate-status">
                <span
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(selectedPlate.status) }}
                ></span>
                {getStatusText(selectedPlate.status)}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>{t('sku')}</label>
                  <div className="value">{selectedPlate.sku}</div>
                </div>
                <div className="info-item">
                  <label>{t('quantity')}</label>
                  <div className="value">{selectedPlate.quantity} {selectedPlate.unitOfMeasure}</div>
                </div>
                <div className="info-item">
                  <label>{t('location')}</label>
                  <div className="value highlight">{selectedPlate.location}</div>
                </div>
                <div className="info-item">
                  <label>{t('facility')}</label>
                  <div className="value">{selectedPlate.facilityId}</div>
                </div>
                {selectedPlate.lotNumber && (
                  <div className="info-item">
                    <label>Lot Number</label>
                    <div className="value">{selectedPlate.lotNumber}</div>
                  </div>
                )}
              </div>

              <div className="metadata">
                <div>{t('customer')}: {selectedPlate.customerId}</div>
                <div>Last Update: {new Date(selectedPlate.lastUpdate).toLocaleString()}</div>
              </div>

              <div className="card-actions">
                <button onClick={() => handleEdit(selectedPlate)} className="edit-btn">{t('edit')}</button>
                <button onClick={() => handleDelete(selectedPlate.id)} className="delete-btn">{t('delete')}</button>
              </div>
            </GlassCard>
          </div>

          <div className="ai-insights">
            <GlassCard title={t('ai_operations_hub')}>
              <div className="ai-suggestion">
                <div className="ai-icon">✨</div>
                <div className="suggestion-content">
                  <label>{t('ai_suggested_displacement')}</label>
                  <div className="suggested-loc">ZONE-A-01</div>
                  <p>Based on predictive velocity and current warehouse optimization throughput.</p>
                </div>
              </div>

              <div className="ai-stats">
                <div className="stat-row">
                  <span>{t('confidence_score')}</span>
                  <span className="stat-value">94%</span>
                </div>
                <div className="stat-row">
                  <span>{t('logic_provider')}</span>
                  <span className="stat-value">Vertex AI (Cached)</span>
                </div>
              </div>

              <button
                className="action-button"
                onClick={handleExecuteAI}
                disabled={moving}
              >
                {moving ? 'Processing Transaction...' : t('execute_ai')}
              </button>
            </GlassCard>
          </div>
        </div>
      ) : (
        null
      )}

      {showForm && (
        <LicensePlateForm
          plate={editingPlate}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPlate(null); }}
        />
      )}
    </div>
  )
}


export default PlateLookup
