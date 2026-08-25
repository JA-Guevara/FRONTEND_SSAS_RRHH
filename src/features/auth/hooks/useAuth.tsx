import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.ts'
import type { AuthContextValue } from '../context/AuthContext.ts'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}