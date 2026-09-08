import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { empresasApi } from '../../features/empresas/api/empresasApi'
import type { components } from '../../shared/api/schema'

type Company = components['schemas']['EmpresaResponse']

type CompanyScopeContextValue = {
  company: Company | null
  companies: Company[]
  selectedCompanyId: string | null
  /** Mientras se resuelve el catálogo no se puede decidir si hay alcance de empresa. */
  loading: boolean
  error: string | null
  selectCompany: (company: Company) => void
  clearCompany: () => void
  reload: () => void
}

const STORAGE_KEY = 'ssas.selected-company-id'
const CompanyScopeContext = createContext<CompanyScopeContextValue | null>(null)

export function CompanyScopeProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const esPlataforma = status === 'authenticated' && user?.realm === 'platform'

  useEffect(() => {
    if (status === 'loading') return
    if (status !== 'authenticated' || user?.realm !== 'platform') {
      sessionStorage.removeItem(STORAGE_KEY)
      setCompany(null)
      setCompanies([])
      setSelectedCompanyId(null)
      setLoading(false)
    }
  }, [status, user?.realm])

  // El catálogo se resuelve aquí y no en el layout: así una recarga profunda en
  // /usuarios rehidrata la empresa seleccionada antes de que el guard decida.
  useEffect(() => {
    if (!esPlataforma) return
    let active = true
    setLoading(true)
    setError(null)
    empresasApi
      .list()
      .then((page) => {
        if (!active) return
        setCompanies(page.items)
        const stored = sessionStorage.getItem(STORAGE_KEY)
        const selected = page.items.find((item) => item.id === stored) ?? null
        setCompany(selected)
        setSelectedCompanyId(selected?.id ?? null)
        if (selected === null && stored !== null) sessionStorage.removeItem(STORAGE_KEY)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setCompanies([])
        setError(cause instanceof Error ? cause.message : 'No fue posible consultar las empresas.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [esPlataforma, reloadToken])

  const selectCompany = useCallback((nextCompany: Company) => {
    sessionStorage.setItem(STORAGE_KEY, nextCompany.id)
    setSelectedCompanyId(nextCompany.id)
    setCompany(nextCompany)
  }, [])

  const clearCompany = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSelectedCompanyId(null)
    setCompany(null)
  }, [])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return (
    <CompanyScopeContext.Provider
      value={{
        company,
        companies,
        selectedCompanyId,
        loading,
        error,
        selectCompany,
        clearCompany,
        reload,
      }}
    >
      {children}
    </CompanyScopeContext.Provider>
  )
}

export function useCompanyScope() {
  const context = useContext(CompanyScopeContext)
  if (context === null) {
    throw new Error('useCompanyScope debe utilizarse dentro de CompanyScopeProvider')
  }
  return context
}
