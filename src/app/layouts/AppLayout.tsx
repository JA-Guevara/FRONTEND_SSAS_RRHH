import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { empresasApi } from '../../features/empresas/api/empresasApi'
import { Button } from '../../shared/components'
import { useAccess } from '../access/AccessProvider'
import { NAV_ITEMS } from '../access/navigation'
import type { NavItem } from '../access/navigation'
import { useCompanyScope } from '../context/CompanyScopeContext'

export function AppLayout() {
  const { logout, user } = useAuth()
  const { company, companies, error, selectCompany, clearCompany, loading } = useCompanyScope()
  const { can, hasModulo } = useAccess()
  const [tenantEmpresa, setTenantEmpresa] = useState<string | null>(null)

  const esPlataforma = user?.realm === 'platform'
  const conAlcanceEmpresa = user?.realm === 'tenant' || company !== null

  useEffect(() => {
    if (user?.realm !== 'tenant' || !user?.empresaId) {
      setTenantEmpresa(null)
      return
    }
    let active = true
    empresasApi
      .get(user.empresaId)
      .then((empresa) => {
        if (active) setTenantEmpresa(empresa.nombre_comercial)
      })
      .catch(() => {
        if (active) setTenantEmpresa(null)
      })
    return () => {
      active = false
    }
  }, [user?.realm, user?.empresaId])

  const nombreEmpresaActiva = esPlataforma
    ? company?.nombre_comercial ?? null
    : tenantEmpresa

  function cambiarEmpresa(idEmpresa: string) {
    const next = companies.find((item) => item.id === idEmpresa)
    if (next !== undefined) selectCompany(next)
    else clearCompany()
  }

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
            <label htmlFor="company-scope-select" title="Entra al contexto de la empresa seleccionada">
              Empresa activa
            </label>
            {company !== null && (
              <div className="company-scope-chip">
                <span className="company-scope-dot" style={{ background: company.color_primario }} />
                <span>{company.nombre_comercial}</span>
              </div>
            )}
            <select
              id="company-scope-select"
              value={company?.id ?? ''}
              onChange={(event) => cambiarEmpresa(event.target.value)}
            >
              <option value="">Seleccionar empresa</option>
              {companies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre_comercial}
                </option>
              ))}
            </select>
            {loading && <small>Cargando catálogo…</small>}
            {error !== null && <small>{error}</small>}
            {company !== null && (
              <small className="company-scope-hint">Todo el menú opera sobre esta empresa.</small>
            )}
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
        {conAlcanceEmpresa && (
          <header className="scope-header">
            <div className="scope-header-chip">
              <span
                className="scope-header-dot"
                style={{ background: company?.color_primario ?? 'var(--brand)' }}
              />
              <div>
                <span className="scope-header-label">Empresa activa</span>
                <strong>{esPlataforma ? (nombreEmpresaActiva ?? 'Sin empresa seleccionada') : (nombreEmpresaActiva ?? 'Mi empresa')}</strong>
              </div>
            </div>
            {esPlataforma && companies.length > 1 && (
              <select
                className="scope-header-select"
                aria-label="Cambiar empresa activa"
                value={company?.id ?? ''}
                onChange={(event) => cambiarEmpresa(event.target.value)}
              >
                <option value="">Sin empresa</option>
                {companies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre_comercial}
                  </option>
                ))}
              </select>
            )}
            {esPlataforma && company === null && (
              <small className="scope-header-hint">Selecciona una empresa para operar sobre todo el sistema.</small>
            )}
          </header>
        )}
        <Outlet />
      </main>
    </div>
  )
}
