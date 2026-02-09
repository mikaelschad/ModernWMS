import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EntitySelector from '../EntitySelector'

// Mock config
vi.mock('../../config', () => ({
    config: {
        entitySelectorThreshold: 5
    }
}))

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}))

describe('EntitySelector', () => {
    const mockItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
    ]
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders dropdown when items <= threshold', () => {
        render(
            <EntitySelector
                items={mockItems}
                value=""
                onChange={mockOnChange}
                threshold={5}
                label="Test Label"
            />
        )
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders search mode when items > threshold', () => {
        const largeList = Array.from({ length: 6 }, (_, i) => ({ id: `${i}`, name: `Item ${i}` }))
        render(
            <EntitySelector
                items={largeList}
                value=""
                onChange={mockOnChange}
                threshold={5}
                label="Test Label"
            />
        )
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
        expect(screen.getByTitle('Search Test Label')).toBeInTheDocument()
    })

    it('opens search modal on button click', async () => {
        const largeList = Array.from({ length: 6 }, (_, i) => ({ id: `${i}`, name: `Item ${i}` }))
        render(
            <EntitySelector
                items={largeList}
                value=""
                onChange={mockOnChange}
                threshold={5}
                label="Test Label"
                columns={[{ key: 'name', label: 'Name' }]}
                searchFields={['name']}
            />
        )

        fireEvent.click(screen.getByTitle('Search Test Label'))

        // Modal should appear
        await waitFor(() => {
            expect(screen.getByText('Select Test Label')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
        })
    })

    it('calls onChange when item selected from modal', async () => {
        const largeList = Array.from({ length: 6 }, (_, i) => ({ id: `${i}`, name: `Item ${i}` }))
        render(
            <EntitySelector
                items={largeList}
                value=""
                onChange={mockOnChange}
                threshold={5}
                label="Test Label"
                columns={[{ key: 'name', label: 'Name' }]}
                searchFields={['name']}
            />
        )

        fireEvent.click(screen.getByTitle('Search Test Label'))

        await waitFor(() => {
            expect(screen.getByText('Item 2')).toBeInTheDocument()
        })

        const row = screen.getByText('Item 2').closest('tr')
        fireEvent.click(row)

        expect(mockOnChange).toHaveBeenCalledWith('2')
    })
})
