import { NavLink } from 'react-router-dom'
import { BriefcaseBusiness, House, UserRound, Users } from 'lucide-react'

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegación rápida móvil">
      <NavLink to="/" end aria-label="Inicio (móvil)">
        <House size={20} aria-hidden="true" />
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/vacantes" aria-label="Vacantes (móvil)">
        <BriefcaseBusiness size={20} aria-hidden="true" />
        <span>Vacantes</span>
      </NavLink>
      <NavLink to="/postulantes" aria-label="Postulantes (móvil)">
        <Users size={20} aria-hidden="true" />
        <span>Postulantes</span>
      </NavLink>
      <NavLink to="/perfil" aria-label="Perfil (móvil)">
        <UserRound size={20} aria-hidden="true" />
        <span>Perfil</span>
      </NavLink>
    </nav>
  )
}
