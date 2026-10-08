import { useEffect, useState } from 'react'
import {
  confirmarEntrevista,
  consultarEntrevista,
  type EntrevistaPublica,
  PortalApiError,
} from '../api/portalApi'
import { formatearFechaHora } from '../utils/formato'
import { Alert, Button, EstadoBadge } from '../../../shared/components'

type Props = {
  codigo: string
}

export function EntrevistaAgendada({ codigo }: Props) {
  const [entrevista, setEntrevista] = useState<EntrevistaPublica | null>(null)
  const [cargando, setCargando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    setCargando(true)

    consultarEntrevista(codigo)
      .then((data) => {
        if (activo) {
          setEntrevista(data)
          if (data.estado === 'CONFIRMADA') {
            setMensajeExito(true)
          }
        }
      })
      .catch((err) => {
        if (activo) {
          // Si responde 404 no hay entrevista agendada
          if (err instanceof PortalApiError && err.status === 404) {
            setEntrevista(null)
          }
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [codigo])

  if (cargando || !entrevista) {
    return null
  }

  const handleConfirmar = async () => {
    setConfirmando(true)
    setErrorConfirmacion(null)
    try {
      const actualizada = await confirmarEntrevista(codigo)
      setEntrevista(actualizada)
      setMensajeExito(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar la entrevista'
      setErrorConfirmacion(msg)
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <section aria-label="Entrevista agendada" className="panel flow-sm mt-4">
      <div className="flex-between">
        <h3 className="text-lg font-semibold">Entrevista agendada</h3>
        <EstadoBadge estado={entrevista.estado} />
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <span className="text-muted">Fecha y hora:</span>{' '}
          <strong>{formatearFechaHora(entrevista.fecha_hora) ?? entrevista.fecha_hora}</strong>
        </div>
        <div>
          <span className="text-muted">Duración:</span>{' '}
          <strong>{entrevista.duracion_min} minutos</strong>
        </div>
        <div>
          <span className="text-muted">Modalidad:</span>{' '}
          <strong>{entrevista.modalidad}</strong>
        </div>
        {entrevista.modalidad === 'VIRTUAL' && entrevista.enlace_reunion && (
          <div>
            <span className="text-muted">Enlace:</span>{' '}
            <a
              href={entrevista.enlace_reunion}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Unirse a la reunión
            </a>
          </div>
        )}
        {entrevista.modalidad === 'PRESENCIAL' && entrevista.lugar && (
          <div>
            <span className="text-muted">Lugar:</span> <strong>{entrevista.lugar}</strong>
          </div>
        )}
      </div>

      {mensajeExito && (
        <Alert tone="success">Confirmaste tu asistencia a la entrevista.</Alert>
      )}

      {errorConfirmacion && (
        <Alert tone="error">{errorConfirmacion}</Alert>
      )}

      {entrevista.estado === 'PROGRAMADA' && !mensajeExito && (
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={handleConfirmar}
            disabled={confirmando}
          >
            {confirmando ? 'Confirmando...' : 'Confirmar asistencia'}
          </Button>
        </div>
      )}
    </section>
  )
}
