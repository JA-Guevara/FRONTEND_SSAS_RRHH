import { useEffect, useState } from 'react'
import { Laptop, Moon, Sun, type LucideIcon } from 'lucide-react'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'ssas:tema'

const OPCIONES: { valor: ThemePreference; etiqueta: string; Icono: LucideIcon }[] = [
  { valor: 'light', etiqueta: 'Claro', Icono: Sun },
  { valor: 'dark', etiqueta: 'Oscuro', Icono: Moon },
  { valor: 'system', etiqueta: 'Auto', Icono: Laptop },
]

function leerTema(): ThemePreference {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
    if (guardado === 'light' || guardado === 'dark' || guardado === 'system') return guardado
  } catch {
    // Ignorar fallo de almacenamiento en modo privado
  }
  return 'system'
}

/** Control segmentado de tema: la opción activa se ve sin tener que pulsarla. */
export function SelectorTema() {
  const [tema, setTema] = useState<ThemePreference>(leerTema)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, tema)
    } catch {
      // Ignorar fallo
    }

    const root = document.documentElement
    if (tema === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', tema)
    }
  }, [tema])

  return (
    <div className="segmented-control" role="radiogroup" aria-label="Tema">
      {OPCIONES.map(({ valor, etiqueta, Icono }) => (
        <button
          key={valor}
          type="button"
          role="radio"
          aria-checked={tema === valor}
          className="segmented-option"
          onClick={() => setTema(valor)}
        >
          <Icono size={14} aria-hidden="true" />
          <span>{etiqueta}</span>
        </button>
      ))}
    </div>
  )
}
