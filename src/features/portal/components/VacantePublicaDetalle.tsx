import { Link } from 'react-router-dom'
import { Badge, Button } from '../../../shared/components'
import type { VacantePublica } from '../api/portalApi'
import { enPalabras, etiquetaModalidad, formatearFecha, formatearSalario } from '../utils/formato'

type Props = {
  vacante: VacantePublica
  /** Ruta del listado, para volver sin perder el sitio. */
  volverHref: string
  onPostular: () => void
}

export function VacantePublicaDetalle({ vacante, volverHref, onPostular }: Props) {
  const salario = vacante.mostrar_salario
    ? formatearSalario(vacante.salario_min, vacante.salario_max)
    : null
  const cierre = formatearFecha(vacante.fecha_cierre)
  const publicacion = formatearFecha(vacante.fecha_publicacion)

  return (
    <article className="panel">
      <p>
        <Link to={volverHref}>Volver a todas las vacantes</Link>
      </p>

      <h1>{vacante.titulo}</h1>

      <p className="public-job-meta">
        <span>{vacante.ubicacion ?? 'Ubicación por confirmar'}</span>
        <span>{etiquetaModalidad(vacante.modalidad)}</span>
        {vacante.departamento_nombre != null && <span>Área: {vacante.departamento_nombre}</span>}
        <span>{cierre !== null ? `Puedes postular hasta el ${cierre}` : 'Sin fecha de cierre'}</span>
      </p>

      {salario !== null && (
        <p className="badge-list">
          <span className="chip">Salario {salario}</span>
        </p>
      )}

      <h2>De qué trata el puesto</h2>
      <p className="public-prose">{vacante.descripcion}</p>

      {vacante.requisitos != null && vacante.requisitos.trim() !== '' && (
        <>
          <h2>Qué necesitas para postular</h2>
          <p className="public-prose">{vacante.requisitos}</p>
        </>
      )}

      {vacante.habilidades.length > 0 && (
        <>
          <h2>Habilidades que buscamos</h2>
          <p className="badge-list">
            {vacante.habilidades.map((habilidad) =>
              habilidad.es_obligatorio ? (
                <Badge key={habilidad.habilidad_id} tone="brand">
                  {habilidad.nombre} · nivel {enPalabras(habilidad.nivel_requerido)} · obligatoria
                </Badge>
              ) : (
                <span key={habilidad.habilidad_id} className="chip">
                  {habilidad.nombre} · nivel {enPalabras(habilidad.nivel_requerido)}
                </span>
              ),
            )}
          </p>
        </>
      )}

      {vacante.beneficios != null && vacante.beneficios.trim() !== '' && (
        <>
          <h2>Qué ofrecemos</h2>
          <p className="public-prose">{vacante.beneficios}</p>
        </>
      )}

      <h2>Datos del puesto</h2>
      <div className="info-list">
        <div className="info-row">
          <span className="info-label">Cargo</span>
          <span className="info-value">{vacante.cargo_nombre ?? 'Sin especificar'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Puestos disponibles</span>
          <span className="info-value">{vacante.cantidad_vacantes}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Experiencia mínima</span>
          <span className="info-value">
            {vacante.experiencia_min > 0
              ? `${vacante.experiencia_min} ${vacante.experiencia_min === 1 ? 'año' : 'años'}`
              : 'No se pide experiencia previa'}
          </span>
        </div>
        {salario !== null && (
          <div className="info-row">
            <span className="info-label">Salario</span>
            <span className="info-value">{salario}</span>
          </div>
        )}
        {publicacion !== null && (
          <div className="info-row">
            <span className="info-label">Publicada el</span>
            <span className="info-value">{publicacion}</span>
          </div>
        )}
      </div>

      <div className="form-actions-start">
        <Button onClick={onPostular}>Postularme a esta vacante</Button>
      </div>
    </article>
  )
}
