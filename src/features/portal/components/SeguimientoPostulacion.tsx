import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, EstadoBadge, Field, Panel } from '../../../shared/components'
import type { components } from '../../../shared/api/schema'
import { consultarPostulacion } from '../api/portalApi'
import { enPalabras, formatearFecha } from '../utils/formato'

type Seguimiento = components['schemas']['SeguimientoPostulacionResponse']

type Props = {
  /** Ruta del listado, para volver a las vacantes. */
  volverHref: string
}

export function SeguimientoPostulacion({ volverHref }: Props) {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<Seguimiento | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConsultar(evento: FormEvent) {
    evento.preventDefault()
    if (codigo.trim() === '') return
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const datos = await consultarPostulacion(codigo.trim().toUpperCase())
      setResultado(datos)
    } catch (causa) {
      setError(
        causa instanceof Error
          ? causa.message
          : 'No encontramos ninguna postulación con ese código.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel
      title="Seguimiento de tu postulación"
      actions={
        <Link to={volverHref} className="button button-secondary">
          Ver las vacantes
        </Link>
      }
    >
      <div className="form-stack">
        <p className="text-muted">
          Escribe el código que te dimos al terminar tu postulación y te decimos en qué paso está.
        </p>

        <form className="form-stack" onSubmit={(evento) => void handleConsultar(evento)}>
          <Field label="Código de seguimiento" hint="Por ejemplo: POS-ABC123XY">
            <input
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
              placeholder="POS-ABC123XY"
              autoComplete="off"
              required
            />
          </Field>
          <div className="form-actions-start">
            <Button type="submit" loading={loading}>
              Consultar
            </Button>
          </div>
        </form>

        {error !== null && (
          <Alert tone="error" title="No pudimos consultar tu postulación">
            {error}
          </Alert>
        )}

        {resultado !== null && (
          <div className="form-stack">
            <p className="badge-list">
              <span className="tracking-code">{resultado.codigo_seguimiento}</span>
            </p>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Vacante</span>
                <span className="info-value">{resultado.vacante}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Estado</span>
                <span className="info-value">
                  <EstadoBadge estado={resultado.estado} />
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Paso del proceso</span>
                <span className="info-value">{enPalabras(resultado.etapa)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Te postulaste el</span>
                <span className="info-value">
                  {formatearFecha(resultado.fecha_postulacion) ?? 'Sin fecha'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Última novedad</span>
                <span className="info-value">
                  {formatearFecha(resultado.fecha_ultimo_cambio) ?? 'Sin fecha'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
