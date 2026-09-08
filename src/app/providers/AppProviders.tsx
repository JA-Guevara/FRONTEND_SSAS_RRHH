import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../../features/auth/providers/AuthProvider'
import { AccessProvider } from '../access/AccessProvider'
import { CompanyScopeProvider } from '../context/CompanyScopeContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyScopeProvider>
          <AccessProvider>{children}</AccessProvider>
        </CompanyScopeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
