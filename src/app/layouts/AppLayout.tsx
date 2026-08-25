import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

export function AppLayout() {
  const { logout, user } = useAuth()
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><div className="brand-mark brand-mark-small" aria-hidden="true">S</div><div><strong>SSAS</strong><span>Recursos Humanos</span></div></div><nav className="main-nav" aria-label="Navegación principal"><NavLink to="/" end>Inicio</NavLink>{user?.realm === 'tenant' ? <><NavLink to="/usuarios">Usuarios</NavLink><NavLink to="/roles">Roles</NavLink><NavLink to="/bitacora">Bitácora</NavLink></> : <NavLink to="/empresas">Empresas</NavLink>}<NavLink to="/cambiar-clave">Cambiar contraseña</NavLink></nav><div className="sidebar-user"><span>{user?.name}</span><small>{user?.email}</small><small>{user?.realm === 'platform' ? 'Administración global' : 'Usuario de empresa'}</small><button className="button button-quiet" onClick={() => void logout()} type="button">Cerrar sesión</button></div></aside><main className="main-content"><Outlet /></main></div>
}
