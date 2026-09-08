import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { Button } from '../../shared/components'
import { useAccess } from '../access/AccessProvider'
import { NAV_ITEMS } from '../access/navigation'
import type { NavItem } from '../access/navigation'
import { useCompanyScope } from '../context/CompanyScopeContext'

export function AppLayout() {
  const { logout, user } = useAuth()
  const { company, companies, error, selectCompany, clearCompany } = useCompanyScope()
  const { can, hasModulo } = useAccess()

  const esPlataforma = user?.realm === 'platform'
  const conAlcanceEmpresa = user?.realm === 'tenant' || company !== null

  // El menú es consecuencia de los módulos habilitados y de los permisos efectivos:
  // no hay ninguna entrada fija salvo Inicio y la cuenta.
  function visible(item: NavItem): boolean {
    if (item.soloRealm !== undefined && item.soloRealm !== user?.realm) return false
    if (item.modulo !== undefined) {
      if (!conAlcanceEmpresa) return false
      if (!hasModulo(item.modulo)) return false
    }
    if (item.permisos !== undefined && !can(...item.permisos)) return false
    return true
  }

  const items = NAV_ITEMS.filter(visible)
  const grupos = items.reduce<Map<string, NavItem[]>>((acc, item) => {
    const grupo = item.grupo ?? ''
    acc.set(grupo, [...(acc.get(grupo) ?? []), item])
    return acc
  }, new Map())

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-small" aria-hidden="true">
            S
          </div>
          <div>
            <strong>SSAS</strong>
            <span>Recursos Humanos</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          {[...grupos.entries()].map(([grupo, entradas]) => (
            <div key={grupo}>
              {grupo !== '' && <p className="nav-group-title">{grupo}</p>}
              {entradas.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {esPlataforma && (
          <div className="company-scope">
            <label htmlFor="company-scope-select">Empresa activa</label>
            <select
              id="company-scope-select"
              value={company?.id ?? ''}
              onChange={(event) => {
                const selected = companies.find((item) => item.id === event.target.value)
                if (selected !== undefined) selectCompany(selected)
                else clearCompany()
              }}
            >
              <option value="">Seleccionar empresa</option>
              {companies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre_comercial}
                </option>
              ))}
            </select>
            {error !== null && <small>{error}</small>}
          </div>
        )}

        <div className="sidebar-user">
          <span>{user?.name}</span>
          {company !== null && <small>Alcance: {company.nombre_comercial}</small>}
          <small>{user?.email}</small>
          <small>{esPlataforma ? 'Administración global' : 'Usuario de empresa'}</small>
          <Button variant="quiet" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
