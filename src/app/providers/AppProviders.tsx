import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../../features/auth/providers/AuthProvider.tsx'
import { CompanyScopeProvider } from '../context/CompanyScopeContext.tsx'

export function AppProviders({ children }: { children: ReactNode }) {
  return <BrowserRouter><AuthProvider><CompanyScopeProvider>{children}</CompanyScopeProvider></AuthProvider></BrowserRouter>
}
