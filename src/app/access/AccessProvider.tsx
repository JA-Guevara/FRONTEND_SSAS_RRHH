import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { modulosApi } from '../../features/empresas/api/modulosApi'
import { useCompanyScope } from '../context/CompanyScopeContext'

type AccessContextValue = {
  /** Permisos efectivos del usuario, tal como los calcula el backend. */
  permissions: string[]
  /** Módulos disponibles en el alcance actual (empresa propia o empresa seleccionada). */
  modulos: string[]
  /** Verdadero si el usuario tiene ALGUNO de los permisos indicados. */
  can: (...codigos: string[]) => boolean
  hasModulo: (codigo: string) => boolean
  loadingModulos: boolean
}

const AccessContext = createContext<AccessContextValue | null>(null)

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { company } = useCompanyScope()
  const [companyModulos, setCompanyModulos] = useState<string[]>([])
  const [loadingModulos, setLoadingModulos] = useState(false)

  const esPlataforma = user?.realm === 'platform'
  const companyId = company?.id ?? null

  // Un administrador de plataforma ve el menú de la empresa que tiene seleccionada,
  // no el suyo: sus módulos hay que consultarlos aparte.
  useEffect(() => {
    if (!esPlataforma || companyId === null) {
      setCompanyModulos([])
      return
    }
    let active = true
    setLoadingModulos(true)
    modulosApi
      .porEmpresa(companyId)
      .then((modulos) => {
        if (active) setCompanyModulos(modulos.filter((m) => m.habilitado).map((m) => m.codigo))
      })
      .catch(() => {
        if (active) setCompanyModulos([])
      })
      .finally(() => {
        if (active) setLoadingModulos(false)
      })
    return () => {
      active = false
    }
  }, [esPlataforma, companyId])

  const value = useMemo<AccessContextValue>(() => {
    const permissions = user?.permissions ?? []
    const modulos = esPlataforma ? companyModulos : (user?.modulos ?? [])
    const permissionSet = new Set(permissions)
    const moduloSet = new Set(modulos)
    return {
      permissions,
      modulos,
      can: (...codigos: string[]) => codigos.some((codigo) => permissionSet.has(codigo)),
      hasModulo: (codigo: string) => moduloSet.has(codigo),
      loadingModulos,
    }
  }, [user?.permissions, user?.modulos, esPlataforma, companyModulos, loadingModulos])

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess(): AccessContextValue {
  const context = useContext(AccessContext)
  if (context === null) throw new Error('useAccess debe utilizarse dentro de AccessProvider')
  return context
}

/** Oculta una acción cuando el usuario no tiene ninguno de los permisos indicados. */
export function Can({ permisos, children }: { permisos: string[]; children: ReactNode }) {
  const { can } = useAccess()
  return can(...permisos) ? <>{children}</> : null
}
