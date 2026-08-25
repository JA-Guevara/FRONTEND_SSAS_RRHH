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
<<<<<<< HEAD:src/app/layouts/AppLayout.jsx
          <NavLink to="/" end>Inicio</NavLink><NavLink to="/usuarios">Usuarios</NavLink><NavLink to="/bitacora">Bitácora</NavLink>
=======
          <NavLink to="/" end>Inicio</NavLink><NavLink to="/empresa">Empresa</NavLink><NavLink to="/parametros-ley">Parámetros de ley</NavLink><NavLink to="/bitacora">Bitácora</NavLink>
>>>>>>> 52f4ca0be4c097fab5c33b16e11918bb28f3b650:src/app/layouts/AppLayout.tsx
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
