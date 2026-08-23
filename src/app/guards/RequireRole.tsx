import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../features/auth/hooks/useAuth.tsx'
import { FullPageStatus } from '../../shared/components/FullPageStatus.tsx'

type RequireRoleProps = {
  allowedRoles: string | string[]
  children: ReactNode
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <FullPageStatus message="Comprobando tu sesión…" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(user?.rol ?? '') ? children : <Navigate to="/" replace />
}