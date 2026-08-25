import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { FullPageStatus } from '../../shared/components/FullPageStatus'

type RequireRoleProps = {
  roles: string[]
  children: ReactNode
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <FullPageStatus message="Comprobando permisos…" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  // Si el backend aún no envía rol, dejamos pasar
  if (!user?.rol) {
    return <>{children}</>
  }

  if (!roles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}