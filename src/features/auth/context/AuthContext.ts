import { createContext } from 'react'
import type { AuthRealm, StoredSession } from '../../../shared/api/session'

export type { AuthRealm }
export type Session = StoredSession

export type User = {
  id: string
  name: string
  email: string
  username?: string | null
  roles: string[]
  /** Permisos efectivos que devuelve el backend, ya filtrados por módulo habilitado. */
  permissions: string[]
  /** Códigos de módulo disponibles para la empresa. Vacío para plataforma. */
  modulos: string[]
  realm: AuthRealm
  empresaId: string | null
  is_active: boolean
  email_verified: boolean
  must_change_password?: boolean
}

export type LoginCredentials = {
  realm: AuthRealm
  login: string
  password: string
  empresaSlug?: string
}

export type AuthContextValue = {
  accessToken: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  status: 'loading' | 'anonymous' | 'authenticated'
  user: User | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
