import type { ReactNode } from 'react'
import { EmptyState } from '../../shared/components'
import { useAccess } from '../access/AccessProvider'

type RequireAccessProps = {
  children: ReactNode
  /** Módulo que la empresa debe tener habilitado. */
  modulo?: string
  /** Basta con tener uno de estos permisos. */
  permisos?: string[]
}

/** Cierra la ruta cuando el módulo no está contratado o falta el permiso.
 *  No sustituye al control del backend: solo evita pantallas que solo darían 403. */
export function RequireAccess({ children, modulo, permisos }: RequireAccessProps) {
  const { can, hasModulo, loadingModulos } = useAccess()

  if (modulo !== undefined) {
    if (loadingModulos) return null
    if (!hasModulo(modulo)) {
      return (
        <div className="page-stack">
          <EmptyState
            title="Módulo no habilitado"
            message="Tu empresa no tiene contratado este módulo. Solicítalo al administrador de la plataforma."
          />
        </div>
      )
    }
  }

  if (permisos !== undefined && permisos.length > 0 && !can(...permisos)) {
    return (
      <div className="page-stack">
        <EmptyState
          title="No tienes acceso a esta sección"
          message="Tu rol no incluye los permisos necesarios. Consulta con el administrador de tu empresa."
        />
      </div>
    )
  }

  return <>{children}</>
}
