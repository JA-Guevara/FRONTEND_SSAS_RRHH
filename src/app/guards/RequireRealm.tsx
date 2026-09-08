import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AuthRealm } from '../../features/auth/context/AuthContext'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { FullPageStatus } from '../../shared/components/FullPageStatus'
import { useCompanyScope } from '../context/CompanyScopeContext'

type RequireRealmProps = {
  realm: AuthRealm
  children: ReactNode
  allowPlatformScope?: boolean
}

export function RequireRealm({ realm, children, allowPlatformScope = false }: RequireRealmProps) {
  const { user } = useAuth()
  const { company, loading } = useCompanyScope()

  if (user?.realm === realm) return <>{children}</>
  if (allowPlatformScope && user?.realm === 'platform') {
    // Sin esta espera, recargar en una vista de empresa expulsaba al inicio antes
    // de que el catálogo rehidratara la empresa seleccionada.
    if (loading) return <FullPageStatus message="Cargando el alcance de empresa…" />
    if (company !== null) return <>{children}</>
    return <Navigate to="/empresas" replace />
  }
  return <Navigate to="/" replace />
}
