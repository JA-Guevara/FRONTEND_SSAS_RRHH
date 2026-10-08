import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'ssas:tema'

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    } catch {
      // Ignorar fallo de almacenamiento en modo privado
    }
    return 'system'
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignorar fallo
    }

    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  function toggleNext() {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  const label =
    theme === 'light'
      ? 'Tema claro activo'
      : theme === 'dark'
      ? 'Tema oscuro activo'
      : 'Tema según el sistema'

  return (
    <button
      type="button"
      className="icon-button"
      title={label}
      aria-label={label}
      onClick={toggleNext}
    >
      {theme === 'light' && <Sun size={18} aria-hidden="true" />}
      {theme === 'dark' && <Moon size={18} aria-hidden="true" />}
      {theme === 'system' && <Monitor size={18} aria-hidden="true" />}
    </button>
  )
}
