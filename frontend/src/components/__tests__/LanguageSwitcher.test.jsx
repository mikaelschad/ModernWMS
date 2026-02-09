import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LanguageSwitcher from '../LanguageSwitcher'

const mockChangeLanguage = vi.fn()
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            language: 'en-US',
            changeLanguage: mockChangeLanguage
        }
    })
}))

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders language options', () => {
        render(<LanguageSwitcher />)
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText(/english/i)).toBeInTheDocument()
    })

    it('changes language on selection', () => {
        render(<LanguageSwitcher />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })
        expect(mockChangeLanguage).toHaveBeenCalledWith('es')
    })
})
