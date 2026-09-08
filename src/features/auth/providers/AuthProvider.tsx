import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { components } from '../../../shared/api/schema'
import { SESSION_EXPIRED_EVENT, tokenStorage } from '../../../shared/api/session'
import { authApi } from '../api/authApi'
import { AuthContext } from '../context/AuthContext'
import type { LoginCredentials, Session, User } from '../context/AuthContext'

type AuthUser = components['schemas']['UserSchema']
let pendingRestore: Promise<{ session: Session; user: User }> | null = null

function normalizeUser(raw: AuthUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    username: raw.username,
    roles: raw.roles ?? [],
    permissions: raw.permissions ?? [],
    modulos: raw.modulos ?? [],
    realm: raw.empresa_id != null ? 'tenant' : 'platform',
    empresaId: raw.empresa_id ?? null,
    is_active: raw.is_active,
    email_verified: raw.email_verified,
    must_change_password: raw.must_change_password,
  }
}

function restoreStoredSession(session: Session) {
  if (pendingRestore === null) {
    pendingRestore = authApi
      .refresh(session)
      .then(async (renewed) => {
        const user = normalizeUser(await authApi.getCurrentUser(renewed.access_token))
        return { session: { ...renewed, realm: user.realm }, user }
      })
      .finally(() => {
        pendingRestore = null
      })
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
      if (session?.refresh_token === undefined || session.realm === undefined) {
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
    return () => {
      active = false
    }
  }, [session, status])

  // El cliente HTTP avisa cuando el refresh token también caducó: se cierra la
  // sesión sin recargar la página, para no perder el estado de la SPA.
  useEffect(() => {
    function handleExpired() {
      setSession(null)
      setUser(null)
      setStatus('anonymous')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [])

  const refreshUser = useCallback(async () => {
    const current = tokenStorage.get()
    if (current === null) return
    setUser(normalizeUser(await authApi.getCurrentUser(current.access_token)))
  }, [])

  async function login(credentials: LoginCredentials) {
    const newSession = await authApi.login(credentials)
    const currentUser = normalizeUser(await authApi.getCurrentUser(newSession.access_token))
    const resolvedSession = { ...newSession, realm: currentUser.realm }
    tokenStorage.set(resolvedSession)
    setSession(resolvedSession)
    setUser(currentUser)
    setStatus('authenticated')
  }

  async function logout() {
    try {
      if (session?.refresh_token !== undefined) await authApi.logout(session)
    } finally {
      tokenStorage.clear()
      setSession(null)
      setUser(null)
      setStatus('anonymous')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken: session?.access_token ?? null,
        login,
        logout,
        refreshUser,
        status,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
