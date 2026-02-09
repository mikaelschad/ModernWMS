import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './SearchModal.css'

export default function SearchModal({ isOpen, onClose, onSelect, title, items, columns, searchFields }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredItems, setFilteredItems] = useState(items)

    useEffect(() => {
        if (!searchTerm) {
            setFilteredItems(items)
            return
        }

        const term = searchTerm.toLowerCase()
        const filtered = items.filter(item => {
            return searchFields.some(field => {
                const value = item[field]
                return value && value.toString().toLowerCase().includes(term)
            })
        })
        setFilteredItems(filtered)
    }, [searchTerm, items, searchFields])

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('')
        }
    }, [isOpen])

    const handleSelect = (item) => {
        onSelect(item)
        onClose()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose()
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div className="search-modal-overlay" onClick={onClose}>
            <div className="search-modal-container" onClick={e => e.stopPropagation()}>
                <div className="search-modal-header">
                    <h2>{title}</h2>
                    <button className="search-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="search-modal-search">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="search-modal-input"
                    />
                </div>

                <div className="search-modal-results">
                    <table>
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                        No results found
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idx) => (
                                    <tr key={idx} onClick={() => handleSelect(item)} className="search-modal-row">
                                        {columns.map(col => (
                                            <td key={col.key}>{item[col.key]}</td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="search-modal-footer">
                    <p>{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
        </div>,
        document.body
    )
}
