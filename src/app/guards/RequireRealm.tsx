import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AuthRealm } from '../../features/auth/context/AuthContext'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useCompanyScope } from '../context/CompanyScopeContext.tsx'

export function RequireRealm({ realm, children, allowPlatformScope = false }: { realm: AuthRealm; children: ReactNode; allowPlatformScope?: boolean }) {
  const { user } = useAuth()
  const { company } = useCompanyScope()
  const allowed = user?.realm === realm || (allowPlatformScope && user?.realm === 'platform' && company !== null)
  return allowed ? <>{children}</> : <Navigate to="/" replace />
}
