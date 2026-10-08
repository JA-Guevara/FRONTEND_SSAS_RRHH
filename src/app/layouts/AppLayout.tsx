import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useAccess } from '../access/AccessProvider'
import { NAV_ITEMS, type NavItem } from '../access/navigation'
import { useCompanyScope } from '../context/CompanyScopeContext'
import { ChatWidget } from '../../features/ayuda/components/ChatWidget'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout, user } = useAuth()
  const { company, companies, selectCompany, clearCompany } = useCompanyScope()
  const { can, hasModulo } = useAccess()
  const { pathname } = useLocation()

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

  const items = NAV_ITEMS.filter(visible)
  const grupos = items.reduce<Map<string, NavItem[]>>((acc, item) => {
    const grupo = item.grupo ?? ''
    acc.set(grupo, [...(acc.get(grupo) ?? []), item])
    return acc
  }, new Map())

  const activeGroup = items.find(
    (item) => item.to !== '/' && (pathname === item.to || pathname.startsWith(`${item.to}/`)),
  )?.grupo ?? null

  const [sectionState, setSectionState] = useState<{ pathname: string; group: string | null }>({
    pathname,
    group: activeGroup,
  })

  const expandedGroup = sectionState.pathname === pathname ? sectionState.group : activeGroup

  function toggleGroup(grupo: string) {
    setSectionState({
      pathname,
      group: expandedGroup === grupo ? null : grupo,
    })
  }

  return (
    <div className="app-shell">
      <Sidebar
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onCloseMenu={() => setMenuOpen(false)}
        grupos={grupos}
        expandedGroup={expandedGroup}
        onToggleGroup={toggleGroup}
        user={user}
        onLogout={() => void logout()}
        company={company}
        companies={companies}
        onSelectCompany={selectCompany}
        onClearCompany={clearCompany}
      />
      <main className="main-content">
        <Outlet />
      </main>
      <MobileNav />
      {esTenant && <ChatWidget />}
    </div>
  )
}
