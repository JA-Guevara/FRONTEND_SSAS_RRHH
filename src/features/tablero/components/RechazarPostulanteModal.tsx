import { useEffect, useState } from 'react'
import { Alert, ConfirmDialog, Field, LoadingBlock } from '../../../shared/components'
import {
  getMotivosRechazo,
  rechazarPostulante,
  type MotivoRechazo,
  type PostulanteDetalle,
} from '../api/tableroApi'

type Props = {
  postulante: PostulanteDetalle
  empresaId?: string
  onClose: () => void
  onSuccess: () => Promise<void> | void
}

/** Confirmación de una acción destructiva: el mismo diálogo que el resto del
 *  producto, con el motivo obligatorio dentro. */
export function RechazarPostulanteModal({ postulante, empresaId, onClose, onSuccess }: Props) {
  const [motivoId, setMotivoId] = useState('')
  const [motivos, setMotivos] = useState<MotivoRechazo[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorMotivos, setErrorMotivos] = useState<string | null>(null)
  const [errorMotivoCampo, setErrorMotivoCampo] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setErrorMotivos(null)
    getMotivosRechazo(empresaId)
      .then((items) => {
        if (activo) setMotivos(items.filter((item) => item.activo))
      })
      .catch((cause: unknown) => {
        if (!activo) return
        // Un fallo de carga no puede parecer «no hay motivos configurados».
        setMotivos([])
        setErrorMotivos(
          cause instanceof Error ? cause.message : 'No se pudieron cargar los motivos de rechazo.',
        )
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [empresaId])

  async function confirmar() {
    if (motivoId === '') {
      // Sin lista de motivos el aviso va al diálogo: el campo no está en pantalla.
      if (motivos.length === 0) {
        setError('No hay ningún motivo de rechazo disponible, así que no se puede descartar.')
      } else {
        setErrorMotivoCampo('Selecciona un motivo de rechazo.')
      }
      return
    }
    setErrorMotivoCampo(null)
    setEnviando(true)
    setError(null)
    try {
      await rechazarPostulante(postulante.id, motivoId, empresaId)
      await onSuccess()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo rechazar la postulación.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ConfirmDialog
      title="Rechazar postulación"
      tone="danger"
      confirmLabel="Confirmar rechazo"
      loading={enviando}
      error={error}
      onCancel={onClose}
      onConfirm={() => void confirmar()}
      message={
        <div className="form-stack">
          <p>
            Vas a descartar la postulación de <strong>{postulante.nombre_postulante}</strong>. Se
            registrará el motivo que elijas y el candidato quedará marcado como descartado.
          </p>

          {cargando ? (
            <LoadingBlock message="Cargando motivos de rechazo…" />
          ) : errorMotivos !== null ? (
            <Alert tone="error">{errorMotivos}</Alert>
          ) : motivos.length === 0 ? (
            <Alert tone="info">
              No hay motivos de rechazo configurados. Configura al menos uno antes de descartar
              candidatos.
            </Alert>
          ) : (
            <Field label="Motivo de rechazo" error={errorMotivoCampo}>
              <select
                value={motivoId}
                onChange={(evento) => {
                  setMotivoId(evento.target.value)
                  setErrorMotivoCampo(null)
                }}
                required
              >
                <option value="">Selecciona un motivo</option>
                {motivos.map((motivo) => (
                  <option key={motivo.id} value={motivo.id}>
                    {motivo.nombre}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      }
    />
  )
}
