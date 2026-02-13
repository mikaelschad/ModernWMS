import React, { useState, useRef, useEffect } from 'react';
import './TagSelect.css';

/**
 * TagSelect - A multi-select component with tag-based UI
 * @param {Array} options - Array of objects with {id, name} structure
 * @param {Array} selected - Array of selected IDs
 * @param {Function} onChange - Callback when selection changes, receives updated array of IDs
 * @param {String} placeholder - Placeholder text for input
 * @param {Boolean} allowAll - Whether to show "ALL" option
 */
const TagSelect = ({ options = [], selected = [], onChange, placeholder = "Select...", allowAll = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAllSelected = selected.includes('ALL');

    const filteredOptions = options.filter(option =>
        option.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = (id) => {
        if (id === 'ALL') {
            // If selecting ALL, clear all other selections
            onChange(isAllSelected ? [] : ['ALL']);
        } else {
            // If selecting a specific item and ALL is selected, remove ALL
            let newSelected;
            if (isAllSelected) {
                newSelected = [id];
            } else if (selected.includes(id)) {
                newSelected = selected.filter(s => s !== id);
            } else {
                newSelected = [...selected, id];
            }
            onChange(newSelected);
        }
    };

    const handleRemoveTag = (id, e) => {
        e.stopPropagation();
        onChange(selected.filter(s => s !== id));
    };

    const getDisplayName = (id) => {
        if (id === 'ALL') return 'ALL';
        const option = options.find(o => o.id === id);
        return option ? `${option.id}` : id;
    };

    return (
        <div className="tag-select-container" ref={containerRef}>
            <div
                className={`tag-select-display ${isOpen ? 'open' : ''}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
            >
                <div className="tag-list">
                    {selected.length === 0 && (
                        <span className="tag-placeholder">{placeholder}</span>
                    )}
                    {selected.map(id => (
                        <span key={id} className="tag-item">
                            {getDisplayName(id)}
                            <button
                                type="button"
                                className="tag-remove"
                                onClick={(e) => handleRemoveTag(id, e)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <span className="tag-dropdown-arrow">▼</span>
            </div>

            {isOpen && (
                <div className="tag-dropdown">
                    <input
                        ref={inputRef}
                        type="text"
                        className="tag-search-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="tag-options-list">
                        {allowAll && (
                            <div
                                className={`tag-option ${isAllSelected ? 'selected' : ''}`}
                                onClick={() => handleToggle('ALL')}
                            >
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={() => { }}
                                />
                                <span className="tag-option-label">ALL (All {options.length} items)</span>
                            </div>
                        )}
                        {!isAllSelected && filteredOptions.map(option => (
                            <div
                                key={option.id}
                                className={`tag-option ${selected.includes(option.id) ? 'selected' : ''}`}
                                onClick={() => handleToggle(option.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option.id)}
                                    onChange={() => { }}
                                />
                                <span className="tag-option-label">
                                    {option.id} - {option.name}
                                </span>
                            </div>
                        ))}
                        {filteredOptions.length === 0 && !allowAll && (
                            <div className="tag-no-results">No results</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagSelect;
