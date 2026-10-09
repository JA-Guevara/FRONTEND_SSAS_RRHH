import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  FileText,
  PlusCircle,
  Search,
  Shield,
  User,
} from 'lucide-react'
import { NAV_ITEMS, type NavItem } from '../../app/access/navigation'
import { useAccess } from '../../app/access/AccessProvider'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useCompanyScope } from '../../app/context/CompanyScopeContext'

type Props = {
  open: boolean
  onClose: () => void
}

type PaletteAction = {
  id: string
  titulo: string
  subtitulo?: string
  seccion: 'Destinos' | 'Acciones'
  icono: typeof Briefcase
  ejecutar: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { company } = useCompanyScope()
  const { can, hasModulo } = useAccess()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const esTenant = user?.realm === 'tenant'
  const conAlcanceEmpresa = esTenant || company !== null

  function visible(item: NavItem): boolean {
    if (item.soloRealm !== undefined && item.soloRealm !== user?.realm) return false
    if (item.modulo !== undefined) {
      if (!conAlcanceEmpresa) return false
      if (!hasModulo(item.modulo)) return false
    }
    if (item.permisos !== undefined && !can(...item.permisos)) return false
    return true
  }

  // Colección de destinos accesibles
  const destinosVisibles: PaletteAction[] = NAV_ITEMS.filter(visible).map((item) => ({
    id: `nav-${item.to}`,
    titulo: item.label,
    subtitulo: item.grupo ?? 'Navegación',
    seccion: 'Destinos',
    icono: item.icon,
    ejecutar: () => {
      navigate(item.to)
      onClose()
    },
  }))

  // Colección de acciones rápidas
  const accionesRapidas: PaletteAction[] = [
    {
      id: 'act-nueva-vacante',
      titulo: 'Crear nueva vacante',
      subtitulo: 'Reclutamiento',
      seccion: 'Acciones',
      icono: PlusCircle,
      ejecutar: () => {
        navigate('/vacantes/nueva')
        onClose()
      },
    },
    {
      id: 'act-reporte',
      titulo: 'Ver reportes e indicadores',
      subtitulo: 'Análisis y métricas',
      seccion: 'Acciones',
      icono: FileText,
      ejecutar: () => {
        navigate('/reportes')
        onClose()
      },
    },
    {
      id: 'act-bitacora',
      titulo: 'Consultar bitácora de auditoría',
      subtitulo: 'Eventos del sistema',
      seccion: 'Acciones',
      icono: Shield,
      ejecutar: () => {
        navigate('/bitacora')
        onClose()
      },
    },
    {
      id: 'act-mi-cuenta',
      titulo: 'Mi perfil y cuenta',
      subtitulo: 'Preferencias personales',
      seccion: 'Acciones',
      icono: User,
      ejecutar: () => {
        navigate('/cuenta?tab=perfil')
        onClose()
      },
    },
  ]

  const todasLasOpciones = [...destinosVisibles, ...accionesRapidas]

  const filtradas = query.trim() === ''
    ? todasLasOpciones
    : todasLasOpciones.filter((op) => {
        const q = query.toLowerCase()
        return (
          op.titulo.toLowerCase().includes(q) ||
          (op.subtitulo && op.subtitulo.toLowerCase().includes(q))
        )
      })

  // Agrupadas por sección
  const secciones = ['Destinos', 'Acciones'] as const
  const grupos = secciones
    .map((sec) => ({
      nombre: sec,
      items: filtradas.filter((it) => it.seccion === sec),
    }))
    .filter((g) => g.items.length > 0)

  // Lista aplanada para navegación con teclado
  const itemsAplanados = grupos.flatMap((g) => g.items)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      window.setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, itemsAplanados.length))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev <= 0 ? Math.max(0, itemsAplanados.length - 1) : prev - 1,
        )
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const selected = itemsAplanados[selectedIndex]
        if (selected) {
          selected.ejecutar()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, itemsAplanados, selectedIndex, onClose])

  if (!open) return null

  let contadorGlobal = 0

  return (
    <div
      className="command-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="command-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="command-search-row">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            className="command-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar destino o ejecutar acción…"
            aria-label="Buscar en SSAS RRHH"
          />
          <kbd className="command-kbd">Esc</kbd>
        </div>

        <div className="command-results" ref={listRef} role="listbox">
          {itemsAplanados.length === 0 ? (
            <div className="command-empty">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            grupos.map((grupo) => (
              <div key={grupo.nombre}>
                <div className="command-section-title">{grupo.nombre}</div>
                {grupo.items.map((item) => {
                  const itemIndex = contadorGlobal++
                  const isSelected = itemIndex === selectedIndex
                  const Icon = item.icono

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="command-item"
                      data-selected={isSelected ? 'true' : undefined}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => item.ejecutar()}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="command-item-icon">
                        <Icon size={16} aria-hidden="true" />
                      </div>
                      <div className="command-item-content">
                        <div className="command-item-title">{item.titulo}</div>
                        {item.subtitulo && (
                          <div className="command-item-meta">{item.subtitulo}</div>
                        )}
                      </div>
                      {item.seccion === 'Destinos' && (
                        <kbd className="command-kbd">↵</kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
