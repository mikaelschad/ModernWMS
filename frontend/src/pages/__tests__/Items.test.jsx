import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Items from '../Items'

// Mock EntitySelector to avoid complex interaction
vi.mock('../../components/EntitySelector', () => ({
    default: ({ label, value, onChange, placeholder, items }) => {
        const testid = label ? `select-${label.toLowerCase().replace(/\s+/g, '_')}` : `select-${placeholder?.toLowerCase().replace(/\s+/g, '_')}`;
        return (
            <div data-testid={`entity-selector-${label || placeholder}`}>
                <label>{label}</label>
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    data-testid={testid}
                >
                    <option value="">{placeholder}</option>
                    {items?.map(i => (
                        <option key={i.id} value={i.id}>{i.name || i.description}</option>
                    ))}
                </select>
            </div>
        )
    }
}))

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}))

// Mock GlassCard
vi.mock('../../components/GlassCard', () => ({
    default: ({ children, title }) => (
        <div data-testid="glass-card" title={title}>
            <h2>{title}</h2>
            {children}
        </div>
    )
}))

// Mock fetch
global.fetch = vi.fn()

describe('Items Page', () => {
    const mockItems = [
        { sku: 'ITEM1', description: 'Item 1', customerId: 'CUST1', status: 'A', unitOfMeasure: 'EA', weight: 10 },
        { sku: 'ITEM2', description: 'Item 2', customerId: 'CUST2', status: 'I', unitOfMeasure: 'KG', weight: 20 }
    ]
    const mockCustomers = [
        { id: 'CUST1', name: 'Customer 1', city: 'City 1' },
        { id: 'CUST2', name: 'Customer 2', city: 'City 2' }
    ]
    const mockGroups = [
        { id: 'GRP1', description: 'Group 1', category: 'Cat 1' }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch.mockImplementation((url) => {
            if (url.includes('/api/Item') && !url.includes('/ITEM')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockItems) })
            }
            if (url.includes('/api/Customer')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCustomers) })
            }
            if (url.includes('/api/ItemGroup')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGroups) })
            }
            return Promise.resolve({ ok: false })
        })

        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => null)
        Storage.prototype.setItem = vi.fn()
    })

    it('renders and fetches data', async () => {
        render(<Items />)

        expect(await screen.findByText(/ITEM1/, {}, { timeout: 3000 })).toBeInTheDocument()
        const item1Elements = await screen.findAllByText(/Item 1/, {}, { timeout: 3000 })
        expect(item1Elements.length).toBeGreaterThan(0)

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:5017/api/Item')
    })

    it('filters items when customer is selected', async () => {
        render(<Items />)

        await waitFor(() => expect(screen.getByText('ITEM1')).toBeInTheDocument())

        // Select customer
        // The placeholder is 'all_customers' for the filter
        const customerSelect = screen.getByTestId('select-all_customers')
        fireEvent.change(customerSelect, { target: { value: 'CUST1' } })

        await waitFor(() => {
            expect(screen.queryByText('ITEM2')).not.toBeInTheDocument()
            expect(screen.getByText('ITEM1')).toBeInTheDocument()
        })

        expect(localStorage.setItem).toHaveBeenCalledWith('selectedCustomer', 'CUST1')
    })

    it('switches tabs', async () => {
        render(<Items />)

        await waitFor(() => expect(screen.getByText('item')).toBeInTheDocument())

        const storageTab = screen.getByText('storage')
        fireEvent.click(storageTab)

        expect(screen.getByText('main_tab_placeholder')).toBeInTheDocument()
    })

    it('populates form on edit', async () => {
        render(<Items />)

        await waitFor(() => expect(screen.getByText('ITEM1')).toBeInTheDocument())

        // Find edit buttons. Since we have mocked GlassCard, the title passed to it might change from 'create' to 'edit'.
        // The table has edit buttons.
        const editBtns = screen.getAllByText('edit')
        // editBtns[0] might be the header or form title if it starts as 'edit' (unlikely)
        // Buttons in table are 'edit'. Form title is 'create'.
        fireEvent.click(editBtns[0])

        // Wait for form to populate. SKU input should have value 'ITEM1'
        await waitFor(() => {
            expect(screen.getByDisplayValue('ITEM1')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument()
        })
    })
})
