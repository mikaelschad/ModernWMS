// ThemeSelector.jsx
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import './NavDropdowns.css'

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    const themes = [
        { id: 'light', label: t('light_mode'), icon: '☀️' },
        { id: 'dark', label: t('dark_mode'), icon: '🌙' },
        { id: 'plexus', label: t('plexus_theme'), icon: '⚡' }
    ]

    return (
        <div className="theme-selector">
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="nav-dropdown"
                title={t('select_theme', 'Select Theme')}
            >
                {themes.map(({ id, label, icon }) => (
                    <option key={id} value={id}>
                        {icon} {label}
                    </option>
                ))}
            </select>
        </div>
    )
}
