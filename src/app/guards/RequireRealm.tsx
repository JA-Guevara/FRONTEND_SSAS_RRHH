import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AuthRealm } from '../../features/auth/context/AuthContext'
import { useAuth } from '../../features/auth/hooks/useAuth'

export function RequireRealm({ realm, children }: { realm: AuthRealm; children: ReactNode }) {
  const { user } = useAuth()
  return user?.realm === realm ? <>{children}</> : <Navigate to="/" replace />
}
