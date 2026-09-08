import { useEffect, useState, type FormEvent } from 'react'
import {
  getMotivosRechazo,
  rechazarPostulante,
  type MotivoRechazo,
  type PostulanteDetalle,
} from '../api/tableroApi'

type Props = {
  postulante: PostulanteDetalle | null
  empresaId?: string
  onClose: () => void
  onSuccess: () => Promise<void> | void
}

export function RechazarPostulanteModal({ postulante, empresaId, onClose, onSuccess }: Props) {
  const [motivoId, setMotivoId] = useState('')
  const [motivos, setMotivos] = useState<MotivoRechazo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!postulante) return
    let active = true
    setError('')
    void getMotivosRechazo(empresaId)
      .then((items) => { if (active) setMotivos(items.filter((item) => item.activo)) })
      .catch((err: Error) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [empresaId, postulante])

  if (!postulante) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!motivoId) {
      setError('Selecciona un motivo de rechazo.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await rechazarPostulante(postulante!.id, motivoId, empresaId)
      await onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar la postulación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tb-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tb-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="tb-modal-header danger">
          <div>
            <h3>Rechazar postulación</h3>
            <span className="tb-modal-sub">Candidato: <strong>{postulante.nombre_postulante}</strong></span>
          </div>
          <button className="tb-modal-close" onClick={onClose} type="button" aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tb-modal-body">
            <p className="tb-modal-warning-text">Esta acción descartará la postulación y registrará el motivo seleccionado.</p>
            <div className="tb-form-group">
              <label className="tb-label" htmlFor="motivo-select">Motivo de rechazo</label>
              <select
                id="motivo-select"
                className="tb-select"
                value={motivoId}
                onChange={(event) => setMotivoId(event.target.value)}
                required
              >
                <option value="">Seleccionar motivo</option>
                {motivos.map((motivo) => <option key={motivo.id} value={motivo.id}>{motivo.nombre}</option>)}
              </select>
            </div>
            {motivos.length === 0 && !error && <p>No existen motivos de rechazo configurados.</p>}
            {error && <div className="tb-error-msg">{error}</div>}
          </div>
          <div className="tb-modal-footer">
            <button type="button" className="tb-btn tb-btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="tb-btn tb-btn-danger" disabled={loading || !motivoId}>
              {loading ? 'Rechazando...' : 'Confirmar rechazo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
