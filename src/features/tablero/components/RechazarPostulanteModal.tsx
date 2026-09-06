import { useState, type FormEvent } from 'react'
import {
  MOTIVOS_RECHAZO,
  rechazarPostulante,
  type PostulanteDetalle,
} from '../api/tableroApi'

type Props = {
  postulante: PostulanteDetalle | null
  onClose: () => void
  onSuccess: (postulanteActualizado: PostulanteDetalle) => void
}

export function RechazarPostulanteModal({ postulante, onClose, onSuccess }: Props) {
  const [motivo, setMotivo] = useState<string>('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!postulante) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!motivo) {
      setError('Por favor selecciona un motivo de rechazo de la lista.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const actualizado = await rechazarPostulante(postulante!.id, {
        motivo_rechazo: motivo,
        notas_rechazo: notas,
      })
      onSuccess(actualizado)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al rechazar el postulante.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tb-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tb-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tb-modal-header danger">
          <div className="tb-modal-icon">🚫</div>
          <div>
            <h3>Rechazar postulación</h3>
            <span className="tb-modal-sub">
              Candidato: <strong>{postulante.nombre_postulante}</strong>
            </span>
          </div>
          <button className="tb-modal-close" onClick={onClose} type="button" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tb-modal-body">
            <p className="tb-modal-warning-text">
              Esta acción marcará la postulación de <strong>{postulante.nombre_postulante}</strong> como <em>RECHAZADA</em> y registrará el motivo en su historial.
            </p>

            <div className="tb-form-group">
              <label className="tb-label" htmlFor="motivo-select">
                Motivo de rechazo <i>*</i>
              </label>
              <select
                id="motivo-select"
                className={`tb-select ${!motivo && error ? 'error' : ''}`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              >
                <option value="">-- Selecciona un motivo de rechazo --</option>
                {MOTIVOS_RECHAZO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="tb-form-group">
              <label className="tb-label" htmlFor="notas-rechazo">
                Observaciones / Feedback adicional (opcional)
              </label>
              <textarea
                id="notas-rechazo"
                className="tb-textarea"
                rows={3}
                placeholder="Detalla razones específicas o notas para el equipo de RRHH..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {error && <div className="tb-error-msg">{error}</div>}
          </div>

          <div className="tb-modal-footer">
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="tb-btn tb-btn-danger"
              disabled={loading || !motivo}
            >
              {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}