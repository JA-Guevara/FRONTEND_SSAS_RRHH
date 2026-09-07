import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { components } from '../../shared/api/schema'
import { useAuth } from '../../features/auth/hooks/useAuth'

type Company = components['schemas']['EmpresaResponse']

type CompanyScopeContextValue = {
  company: Company | null
  selectedCompanyId: string | null
  selectCompany: (company: Company) => void
  clearCompany: () => void
}

const STORAGE_KEY = 'ssas.selected-company-id'
const CompanyScopeContext = createContext<CompanyScopeContextValue | null>(null)

export function CompanyScopeProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY))

  useEffect(() => {
    if (status !== 'authenticated' || user?.realm !== 'platform') {
      sessionStorage.removeItem(STORAGE_KEY)
      setCompany(null)
      setSelectedCompanyId(null)
    }
  }, [status, user?.realm])

  function selectCompany(nextCompany: Company) {
    sessionStorage.setItem(STORAGE_KEY, nextCompany.id)
    setSelectedCompanyId(nextCompany.id)
    setCompany(nextCompany)
  }

  function clearCompany() {
    sessionStorage.removeItem(STORAGE_KEY)
    setSelectedCompanyId(null)
    setCompany(null)
  }

  return (
    <CompanyScopeContext.Provider value={{ company, selectedCompanyId, selectCompany, clearCompany }}>
      {children}
    </CompanyScopeContext.Provider>
  )
}

export function useCompanyScope() {
  const context = useContext(CompanyScopeContext)
  if (!context) throw new Error('useCompanyScope debe utilizarse dentro de CompanyScopeProvider')
  return context
}