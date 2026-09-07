import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { empresasApi } from '../../features/empresas/api/empresasApi'
import { useCompanyScope } from '../context/CompanyScopeContext.tsx'
import type { components } from '../../shared/api/schema'

type Company = components['schemas']['EmpresaResponse']

export function AppLayout() {
  const { logout, user } = useAuth()
  const { company, selectedCompanyId, selectCompany, clearCompany } = useCompanyScope()
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    if (user?.realm !== 'platform') return
    void empresasApi.list().then((page) => {
      setCompanies(page.items)
      const selected = page.items.find((item) => item.id === selectedCompanyId)
      if (selected) selectCompany(selected)
    }).catch(() => setCompanies([]))
  }, [selectedCompanyId, user?.realm])

  const hasTenantScope = user?.realm === 'tenant' || company !== null
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
          <NavLink to="/" end>
            Inicio
          </NavLink>
          {hasTenantScope ? (
            <>
              <NavLink to="/vacantes">Vacantes</NavLink>
              <NavLink to="/organizacion">Organización</NavLink>
              <NavLink to="/usuarios">Usuarios</NavLink>
              <NavLink to="/roles">Roles</NavLink>
              <NavLink to="/bitacora">Bitácora</NavLink>
            </>
          ) : (
            <NavLink to="/empresas">Empresas</NavLink>
          )}
          <NavLink to="/cambiar-clave">Cambiar contraseña</NavLink>
        </nav>
        {user?.realm === 'platform' && (
          <div className="company-scope">
            <label htmlFor="company-scope-select">Empresa activa</label>
            <select
              id="company-scope-select"
              value={company?.id ?? ''}
              onChange={(event) => {
                const selected = companies.find((item) => item.id === event.target.value)
                if (selected) selectCompany(selected)
                else clearCompany()
              }}
            >
              <option value="">Seleccionar empresa</option>
              {companies.map((item) => <option key={item.id} value={item.id}>{item.nombre_comercial}</option>)}
            </select>
          </div>
        )}
        <div className="sidebar-user">
          <span>{user?.name}</span>
          {company && <small>Alcance: {company.nombre_comercial}</small>}
          <small>{user?.email}</small>
          <small>
            {user?.realm === 'platform'
              ? 'Administración global'
              : 'Usuario de empresa'}
          </small>
          <button
            className="button button-quiet"
            onClick={() => void logout()}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}