import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchModal from './SearchModal'
import { config } from '../config'
import './EntitySelector.css'

export default function EntitySelector({
    items = [],
    value,
    onChange,
    label,
    displayField = 'name',
    valueField = 'id',
    searchFields = [],
    columns = [],
    threshold = config.entitySelectorThreshold,
    disabled = false,
    placeholder = 'Select...'
}) {
    const { t } = useTranslation()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const useDropdown = items.length <= threshold
    const selectedItem = items.find(item => item[valueField] === value)
    const displayValue = selectedItem ? selectedItem[displayField] : ''

    const handleSelect = (item) => {
        onChange(item[valueField])
    }

    const handleDropdownChange = (e) => {
        onChange(e.target.value)
    }

    if (useDropdown) {
        // Show dropdown for small lists
        return (
            <div className="entity-selector">
                {label && <label className="entity-selector-label">{label}</label>}
                <select
                    value={value || ''}
                    onChange={handleDropdownChange}
                    disabled={disabled}
                    className="entity-selector-dropdown"
                >
                    <option value="">{placeholder}</option>
                    {items.map(item => (
                        <option key={item[valueField]} value={item[valueField]}>
                            {item[displayField]}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

    // Show search button + modal for large lists
    return (
        <div className="entity-selector">
            {label && <label className="entity-selector-label">{label}</label>}
            <div className="entity-selector-search-container">
                <input
                    type="text"
                    value={displayValue}
                    readOnly
                    placeholder={placeholder}
                    disabled={disabled}
                    className="entity-selector-search-input"
                />
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    disabled={disabled}
                    className="entity-selector-search-button"
                    title={`Search ${label || 'items'}`}
                >
                    🔍
                </button>
            </div>

            <SearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelect}
                title={`Select ${label || 'Item'}`}
                items={items}
                columns={columns}
                searchFields={searchFields}
            />
        </div>
    )
}
