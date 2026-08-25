import type { Session } from '../context/AuthContext'

const SESSION_KEY = 'ssas.session.v1'

export const tokenStorage = {
  get(): Session | null {
    try {
      const value = sessionStorage.getItem(SESSION_KEY)
      return value ? JSON.parse(value) as Session : null
    } catch {
      return null
    }
  },
  set(session: Session): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },
  clear(): void {
    sessionStorage.removeItem(SESSION_KEY)
  },
}
