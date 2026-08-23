import type { Session } from '../context/AuthContext'

const SESSION_KEY = 'ssah.session'

export const tokenStorage = {
  get(): Session | null {
    try {
      const value = localStorage.getItem(SESSION_KEY)
      return value ? JSON.parse(value) as Session : null
    } catch {
      return null
    }
  },
  set(session: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },
  clear(): void {
    localStorage.removeItem(SESSION_KEY)
  },
}