import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth.tsx'

export function AppLayout() {
  const { logout, user } = useAuth()
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-small" aria-hidden="true">S</div>
          <div><strong>SSAH</strong><span>Recursos Humanos</span></div>
        </div>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink><NavLink to="/bitacora">Bitácora</NavLink>
        </nav>
        <div className="sidebar-user">
          <span>{user?.name}</span><small>{user?.email}</small>
          <button className="button button-quiet" onClick={logout} type="button">Cerrar sesión</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
