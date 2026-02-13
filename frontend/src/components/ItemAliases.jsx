import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import Button from './common/Button'
import { useAuth } from '../context/AuthContext'

export default function ItemAliases({ itemId, customerId }) {
    const { t } = useTranslation()
    const { hasPermission } = useAuth()
    const [aliases, setAliases] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Form state
    const [newAlias, setNewAlias] = useState('')
    const [newType, setNewType] = useState('UPC')

    useEffect(() => {
        if (itemId && customerId) {
            fetchAliases()
        }
    }, [itemId, customerId])

    const fetchAliases = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`http://localhost:5017/api/ItemAlias/${itemId}`, {
                params: { customerId }
            })
            setAliases(res.data)
            setError(null)
        } catch (err) {
            console.error(err)
            const errorText = err.response?.data || err.message
            setError(typeof errorText === 'string' ? errorText : t('error_fetch', { item: t('aliases') }))
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!newAlias.trim()) return

        try {
            await axios.post('http://localhost:5017/api/ItemAlias', {
                itemId,
                customerId,
                alias: newAlias,
                type: newType
            })
            setNewAlias('')
            fetchAliases()
        } catch (err) {
            console.error(err)
            setError(t('error_save'))
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(t('confirm_delete', { item: t('alias') }))) return
        try {
            await axios.delete(`http://localhost:5017/api/ItemAlias/${id}`, {
                params: { customerId }
            })
            fetchAliases()
        } catch (err) {
            console.error(err)
            setError(t('error_delete'))
        }
    }

    const canEdit = hasPermission("ITEM_UPDATE")

    return (
        <div className="aliases-section">
            {error && <div className="error-msg">{error}</div>}

            {canEdit && (
                <div className="add-alias-form" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>{t('add_alias')}</label>
                        <input
                            type="text"
                            value={newAlias}
                            onChange={e => setNewAlias(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd(e)}
                            placeholder={t('alias_value')}
                            disabled={loading}
                            maxLength={50}
                        />
                    </div>
                    <div className="form-group" style={{ width: '150px' }}>
                        <label>{t('type')}</label>
                        <select value={newType} onChange={e => setNewType(e.target.value)} disabled={loading}>
                            <option value="UPC">UPC</option>
                            <option value="EAN">EAN</option>
                            <option value="VENDOR">VENDOR</option>
                            <option value="CUSTOM">CUSTOM</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <Button type="button" size="sm" disabled={loading} onClick={handleAdd}>
                            {t('add_alias')}
                        </Button>
                    </div>
                </div>
            )}

            <div className="master-table">
                <table>
                    <thead>
                        <tr>
                            <th>{t('alias')}</th>
                            <th>{t('type')}</th>
                            <th>{t('last_user')}</th>
                            <th>{t('last_update')}</th>
                            {canEdit && <th>{t('actions')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {aliases.map(alias => (
                            <tr key={alias.id}>
                                <td>{alias.alias}</td>
                                <td>{alias.type}</td>
                                <td>{alias.lastUser}</td>
                                <td>{alias.lastUpdate ? new Date(alias.lastUpdate).toLocaleString() : ''}</td>
                                {canEdit && (
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleDelete(alias.id)}
                                        >
                                            {t('delete')}
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {aliases.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>
                                    {t('no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    )
}
