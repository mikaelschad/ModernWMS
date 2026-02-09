import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import './ThemeSelector.css'

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
            {themes.map(({ id, label, icon }) => (
                <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`theme-btn ${theme === id ? 'active' : ''}`}
                    title={label}
                >
                    <span className="theme-icon">{icon}</span>
                </button>
            ))}
        </div>
    )
}
