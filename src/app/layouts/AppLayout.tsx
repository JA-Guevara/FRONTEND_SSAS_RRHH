import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useAccess } from '../access/AccessProvider'
import { NAV_ITEMS, type NavItem } from '../access/navigation'
import { useCompanyScope } from '../context/CompanyScopeContext'
import { Asistente } from '../../features/ayuda/components/Asistente'
import { CommandPalette } from '../../shared/components'
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

  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        onOpenCommand={() => setCommandOpen(true)}
      />
      <main className="main-content">
        <Outlet />
      </main>
      <MobileNav />
      <Asistente />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
