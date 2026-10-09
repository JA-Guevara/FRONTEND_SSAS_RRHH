import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Laptop,
  LogOut,
  Menu,
  Palette,
  Search,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react'
import { Avatar } from '../../shared/components/avatar/Avatar'
import { useCerrarAlClicFuera } from '../../shared/hooks'
import type { NavItem } from '../access/navigation'
import type { User } from '../../features/auth/context/AuthContext'
import type { components } from '../../shared/api/schema'
import { NavGroup } from './NavGroup'
import { SelectorTema } from './SelectorTema'

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
  onOpenCommand?: () => void
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
  onOpenCommand,
}: SidebarProps) {
  const esPlataforma = user?.realm === 'platform'
  const [menuUsuarioOpen, setMenuUsuarioOpen] = useState(false)
  const menuCuenta = useCerrarAlClicFuera<HTMLDivElement>(menuUsuarioOpen, () =>
    setMenuUsuarioOpen(false),
  )

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

      {onOpenCommand && (
        <div className="sidebar-search-box">
          <button
            type="button"
            className="command-trigger-btn"
            onClick={onOpenCommand}
            aria-label="Buscar o ejecutar comandos"
          >
            <span className="command-trigger-label">
              <Search size={15} aria-hidden="true" />
              <span>Buscar o ejecutar…</span>
            </span>
            <kbd className="command-kbd">⌘K</kbd>
          </button>
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
        {menuUsuarioOpen && (
          <div className="sidebar-user-dropdown" ref={menuCuenta.ref} role="menu" aria-label="Menú de cuenta">
            <div className="sidebar-dropdown-header">
              <div className="sidebar-dropdown-name truncate">{user?.name}</div>
              <div className="sidebar-dropdown-email truncate">{user?.email}</div>
            </div>

            <Link
              to="/cuenta?tab=perfil"
              className="sidebar-dropdown-link"
              role="menuitem"
              onClick={() => {
                setMenuUsuarioOpen(false)
                onCloseMenu()
              }}
            >
              <UserIcon size={16} />
              <span>Mi perfil</span>
            </Link>

            <Link
              to="/cuenta?tab=seguridad"
              className="sidebar-dropdown-link"
              role="menuitem"
              onClick={() => {
                setMenuUsuarioOpen(false)
                onCloseMenu()
              }}
            >
              <Shield size={16} />
              <span>Seguridad</span>
            </Link>

            <Link
              to="/cuenta?tab=preferencias"
              className="sidebar-dropdown-link"
              role="menuitem"
              onClick={() => {
                setMenuUsuarioOpen(false)
                onCloseMenu()
              }}
            >
              <Palette size={16} />
              <span>Preferencias</span>
            </Link>

            <Link
              to="/cuenta?tab=notificaciones"
              className="sidebar-dropdown-link"
              role="menuitem"
              onClick={() => {
                setMenuUsuarioOpen(false)
                onCloseMenu()
              }}
            >
              <Bell size={16} />
              <span>Notificaciones</span>
            </Link>

            <Link
              to="/cuenta?tab=sesiones"
              className="sidebar-dropdown-link"
              role="menuitem"
              onClick={() => {
                setMenuUsuarioOpen(false)
                onCloseMenu()
              }}
            >
              <Laptop size={16} />
              <span>Sesiones activas</span>
            </Link>

            <div className="sidebar-dropdown-divider" />

            <div className="sidebar-dropdown-footer">
              <span className="sidebar-dropdown-email">Tema</span>
              <SelectorTema />
            </div>

            <div className="sidebar-dropdown-divider" />

            <button
              type="button"
              className="sidebar-dropdown-link"
              role="menuitem"
              onClick={() => {
                setMenuUsuarioOpen(false)
                onLogout()
              }}
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="sidebar-avatar-trigger"
          aria-expanded={menuUsuarioOpen}
          aria-haspopup="menu"
          ref={menuCuenta.refDisparador}
          onClick={() => setMenuUsuarioOpen(!menuUsuarioOpen)}
        >
          <Avatar src={user?.foto_url} name={user?.name} id={user?.id} size="sm" />
          <div className="sidebar-avatar-meta">
            <span className="sidebar-avatar-name truncate">{user?.name}</span>
            <span className="sidebar-avatar-role truncate">
              {esPlataforma ? 'Plataforma' : (user?.roles?.[0] ?? 'Usuario')}
            </span>
          </div>
          {menuUsuarioOpen ? (
            <ChevronDown size={16} className="sidebar-avatar-chevron" />
          ) : (
            <ChevronUp size={16} className="sidebar-avatar-chevron" />
          )}
        </button>
      </div>
    </aside>
  )
}
