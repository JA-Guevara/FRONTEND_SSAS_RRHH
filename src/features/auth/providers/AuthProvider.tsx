import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { AuthContext } from '../context/AuthContext.ts'
import type { Session, User } from '../context/AuthContext.ts'
import { tokenStorage } from '../storage/tokenStorage'

let pendingRestore: Promise<{ session: Session; user: User }> | null = null

function restoreStoredSession(session: Session) {
  if (!pendingRestore) {
    pendingRestore = authApi.refresh(session.refresh_token)
      .then(async (renewed) => ({
        session: renewed,
        user: await authApi.getCurrentUser(renewed.access_token),
      }))
      .finally(() => { pendingRestore = null })
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
      if (!session?.refresh_token) {
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

    if (status === 'loading') restoreSession()
    return () => { active = false }
  }, [session, status])

  async function login(credentials: { email: string; password: string }) {
    const newSession = await authApi.login(credentials)
    const currentUser = await authApi.getCurrentUser(newSession.access_token)
    tokenStorage.set(newSession)
    setSession(newSession)
    setUser(currentUser)
    setStatus('authenticated')
  }

  async function register(data: unknown) {
    await authApi.register(data)
  }

  async function logout() {
    try {
      if (session?.refresh_token) await authApi.logout(session.refresh_token)
    } finally {
      tokenStorage.clear()
      setSession(null)
      setUser(null)
      setStatus('anonymous')
    }
  }

  const value = {
    accessToken: session?.access_token ?? null,
    login, logout, register, status, user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
