import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { components } from '../../../shared/api/schema'
import { authApi } from '../api/authApi'
import { AuthContext } from '../context/AuthContext'
import type { LoginCredentials, Session, User } from '../context/AuthContext'
import { tokenStorage } from '../storage/tokenStorage'

type TenantUser = components['schemas']['UserSchema']
type PlatformUser = components['schemas']['PlatformAdminResponse']
let pendingRestore: Promise<{ session: Session; user: User }> | null = null

function normalizeUser(raw: TenantUser | PlatformUser, session: Session): User {
  if (session.realm === 'platform') {
    const admin = raw as PlatformUser
    return {
      id: admin.id,
      name: `${admin.nombre} ${admin.apellido}`.trim(),
      email: admin.email,
      username: admin.username,
      roles: ['PLATFORM_ADMIN'],
      realm: 'platform',
      is_active: admin.activo,
      email_verified: admin.email_verified,
    }
  }
  const tenantUser = raw as TenantUser
  return {
    id: tenantUser.id,
    name: tenantUser.name,
    email: tenantUser.email,
    username: tenantUser.username,
    roles: tenantUser.roles ?? [],
    realm: 'tenant',
    is_active: tenantUser.is_active,
    email_verified: tenantUser.email_verified,
    must_change_password: tenantUser.must_change_password,
  }
}

function restoreStoredSession(session: Session) {
  if (!pendingRestore) {
    pendingRestore = authApi.refresh(session).then(async (renewed) => ({
      session: renewed,
      user: normalizeUser(await authApi.getCurrentUser(renewed.realm, renewed.access_token), renewed),
    })).finally(() => { pendingRestore = null })
  }
  return pendingRestore
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => tokenStorage.get())
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'loading' | 'anonymous' | 'authenticated'>('loading')

  useEffect(() => {
    let active = true
    async function restoreSession() {
      if (!session?.refresh_token || !session.realm) {
        tokenStorage.clear()
        if (active) setStatus('anonymous')
        return
      }
      try {
        const restored = await restoreStoredSession(session)
        if (active) {
          tokenStorage.set(restored.session)
          setSession(restored.session)
          setUser(restored.user)
          setStatus('authenticated')
        }
      } catch {
        tokenStorage.clear()
        if (active) {
          setSession(null)
          setUser(null)
          setStatus('anonymous')
        }
      }
    }
    if (status === 'loading') void restoreSession()
    return () => { active = false }
  }, [session, status])

  async function login(credentials: LoginCredentials) {
    const newSession = await authApi.login(credentials)
    const currentUser = normalizeUser(
      await authApi.getCurrentUser(newSession.realm, newSession.access_token),
      newSession,
    )
    tokenStorage.set(newSession)
    setSession(newSession)
    setUser(currentUser)
    setStatus('authenticated')
  }

  async function logout() {
    try {
      if (session?.refresh_token) await authApi.logout(session)
    } finally {
      tokenStorage.clear()
      setSession(null)
      setUser(null)
      setStatus('anonymous')
    }
  }

  return (
    <AuthContext.Provider value={{
      accessToken: session?.access_token ?? null,
      login,
      logout,
      status,
      user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
