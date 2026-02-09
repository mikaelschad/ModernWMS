import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ThemeSelector from '../ThemeSelector'

// Mock useTheme hook
const mockSetTheme = vi.fn()
vi.mock('../../contexts/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: mockSetTheme
    })
}))

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}))

describe('ThemeSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders theme options', () => {
        render(<ThemeSelector />)
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText(/light_mode/i)).toBeInTheDocument()
    })

    it('changes theme on selection', () => {
        render(<ThemeSelector />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dark' } })
        expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })
})
