import { Link } from 'react-router-dom'
import { Alert, Button, EmptyState, LoadingBlock } from '../../../shared/components'
import type { VacantePublica } from '../api/portalApi'
import { etiquetaModalidad, formatearFecha, formatearSalario } from '../utils/formato'

type Props = {
  vacantes: VacantePublica[]
  /** Ruta base del sitio público, para armar el enlace de cada vacante. */
  basePath: string
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function VacantesPublicasList({ vacantes, basePath, loading, error, onRetry }: Props) {
  if (loading) return <LoadingBlock message="Cargando las vacantes…" />

  if (error !== null) {
    return (
      <div className="form-stack">
        <Alert tone="error" title="No pudimos cargar las vacantes">
          {error}
        </Alert>
        <div className="form-actions-start">
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (vacantes.length === 0) {
    return (
      <EmptyState
        title="Sin vacantes por ahora"
        message="Esta empresa no tiene vacantes publicadas ahora mismo. Vuelve a mirar en unos días."
      />
    )
  }

  return (
    <div className="card-grid">
      {vacantes.map((vacante) => {
        const cierre = formatearFecha(vacante.fecha_cierre)
        const salario = vacante.mostrar_salario
          ? formatearSalario(vacante.salario_min, vacante.salario_max)
          : null

        return (
          <Link
            key={vacante.id}
            to={`${basePath}/vacantes/${vacante.id}`}
            className="public-job"
          >
            <h2>{vacante.titulo}</h2>
            <p className="public-job-meta">
              <span>{vacante.ubicacion ?? 'Ubicación por confirmar'}</span>
              <span>{etiquetaModalidad(vacante.modalidad)}</span>
              <span>
                {cierre !== null ? `Puedes postular hasta el ${cierre}` : 'Sin fecha de cierre'}
              </span>
            </p>
            {salario !== null && (
              <p className="public-job-meta">
                <span className="chip">Salario {salario}</span>
              </p>
            )}
          </Link>
        )
      })}
    </div>
  )
}
