import { Menu, X } from 'lucide-react'
import { Button } from '../../shared/components'
import type { NavItem } from '../access/navigation'
import type { User } from '../../features/auth/context/AuthContext'
import type { components } from '../../shared/api/schema'
import { NavGroup } from './NavGroup'
import { ThemeToggle } from './ThemeToggle'

type Empresa = components['schemas']['EmpresaResponse']

export type SidebarProps = {
  menuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  grupos: Map<string, NavItem[]>
  expandedGroup: string | null
  onToggleGroup: (grupo: string) => void
  user: User | null
  onLogout: () => void
  company: Empresa | null
  companies: Empresa[]
  onSelectCompany: (empresa: Empresa) => void
  onClearCompany: () => void
}

export function Sidebar({
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  grupos,
  expandedGroup,
  onToggleGroup,
  user,
  onLogout,
  company,
  companies,
  onSelectCompany,
  onClearCompany,
}: SidebarProps) {
  const esPlataforma = user?.realm === 'platform'

  function handleCompanyChange(id: string) {
    if (id === '') {
      onClearCompany()
      return
    }
    const selected = companies.find((c) => c.id === id)
    if (selected) onSelectCompany(selected)
  }

  return (
    <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-small" aria-hidden="true">
            S
          </div>
          <div>
            <strong>SSAS</strong>
            <span>Recursos Humanos</span>
          </div>
        </div>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={onToggleMenu}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Selector de empresa en la barra lateral (contexto permanente) */}
      {(esPlataforma || company !== null) && (
        <div className="company-scope">
          {company !== null && (
            <div className="company-scope-chip">
              <span
                className="company-scope-dot"
                style={{ background: company?.color_primario ?? 'var(--brand)' }}
              />
              <span className="truncate">{company.nombre_comercial}</span>
            </div>
          )}
          {esPlataforma && (
            <select
              aria-label="Cambiar empresa activa"
              value={company?.id ?? ''}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              <option value="">Seleccionar empresa</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_comercial}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <nav id="main-navigation" className="main-nav" aria-label="Navegación principal">
        {[...grupos.entries()].map(([grupo, entradas], index) => (
          <NavGroup
            key={grupo}
            grupo={grupo}
            entradas={entradas}
            index={index}
            open={expandedGroup === grupo}
            onToggle={() => onToggleGroup(grupo)}
            onNavigate={onCloseMenu}
          />
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="row-between">
          <div className="truncate">
            <span className="truncate text-strong">
              {user?.name}
            </span>
            <small>{user?.email}</small>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="quiet" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
