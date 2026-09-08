import { useEffect, useState } from 'react'
import {
  actualizarPuntajePostulante,
  agregarNotaPostulante,
  descargarCV,
  getNotasPostulante,
  type Etapa,
  type NotaPostulante,
  type PostulanteDetalle,
} from '../api/tableroApi'
import { RechazarPostulanteModal } from './RechazarPostulanteModal'

type Props = {
  postulante: PostulanteDetalle | null
  etapas: Etapa[]
  empresaId?: string
  onClose: () => void
  onUpdated: () => Promise<void> | void
}

export function PostulanteDetalleModal({ postulante, etapas, empresaId, onClose, onUpdated }: Props) {
  const [showRechazoModal, setShowRechazoModal] = useState(false)
  const [notas, setNotas] = useState<NotaPostulante[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [puntaje, setPuntaje] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!postulante) return
    let active = true
    setPuntaje(postulante.puntaje_manual ?? '')
    setError('')
    void getNotasPostulante(postulante.id, empresaId)
      .then((items) => { if (active) setNotas(items) })
      .catch((err: Error) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [empresaId, postulante])

  if (!postulante) return null
  const etapaActual = etapas.find((etapa) => etapa.id === postulante.etapa_id)
  const rechazado = postulante.estado === 'DESCARTADA'
  const contratado = postulante.estado === 'CONTRATADA'

  async function guardarPuntaje() {
    if (puntaje === '') return
    setSaving(true)
    setError('')
    try {
      await actualizarPuntajePostulante(postulante!.id, puntaje, empresaId)
      await onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el puntaje')
    } finally {
      setSaving(false)
    }
  }

  async function agregarNota() {
    if (!nuevaNota.trim()) return
    setSaving(true)
    setError('')
    try {
      const nota = await agregarNotaPostulante(postulante!.id, nuevaNota.trim(), empresaId)
      setNotas((current) => [nota, ...current])
      setNuevaNota('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la nota')
    } finally {
      setSaving(false)
    }
  }

  async function bajarCV() {
    setError('')
    try {
      await descargarCV(postulante!.postulante_id, empresaId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo descargar el CV')
    }
  }

  return (
    <>
      <div className="tb-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div className="tb-drawer-card" onClick={(event) => event.stopPropagation()}>
          <div className="tb-drawer-header">
            <div className="tb-drawer-avatar">{postulante.nombre_postulante.charAt(0).toUpperCase()}</div>
            <div className="tb-drawer-title-wrap">
              <div className="tb-drawer-badges">
                {rechazado ? <span className="tb-status-badge rejected">Descartado</span>
                  : contratado ? <span className="tb-status-badge hired">Contratado</span>
                    : <span className="tb-status-badge in-progress">En proceso</span>}
                <span className="tb-etapa-badge">Etapa: {etapaActual?.nombre ?? postulante.etapa}</span>
              </div>
              <h2>{postulante.nombre_postulante}</h2>
              {postulante.vacante_titulo && <span className="tb-vacante-subtitle">Vacante: {postulante.vacante_titulo}</span>}
            </div>
            <button className="tb-modal-close" onClick={onClose} type="button" aria-label="Cerrar">×</button>
          </div>

          <div className="tb-drawer-content">
            {rechazado && <div className="tb-rejection-banner"><div className="tb-rejection-title">Postulación descartada</div><div className="tb-rejection-motive"><strong>Motivo:</strong> {postulante.motivo_rechazo ?? 'No disponible'}</div></div>}
            {error && <div className="tb-error-msg" role="alert">{error}</div>}

            <div className="tb-action-bar">
              <div className="tb-score-box">
                <span className="tb-score-label">Puntaje:</span>
                <div className="tb-score-edit">
                  <input className="tb-score-input" type="number" min={0} max={100} value={puntaje} onChange={(event) => setPuntaje(event.target.value === '' ? '' : Number(event.target.value))} />
                  <button className="tb-btn-score-save" type="button" disabled={saving || puntaje === ''} onClick={() => void guardarPuntaje()}>Guardar</button>
                </div>
              </div>
              <div className="tb-header-actions">
                {postulante.cv_url
                  ? <button type="button" className="tb-btn tb-btn-cv" onClick={() => void bajarCV()}>Descargar CV</button>
                  : <span className="tb-btn tb-btn-secondary">CV no disponible</span>}
                {!rechazado && !contratado && <button type="button" className="tb-btn tb-btn-danger-outline" onClick={() => setShowRechazoModal(true)}>Rechazar candidato</button>}
              </div>
            </div>

            <div className="tb-details-grid">
              <div className="tb-detail-section">
                <h4>Información de contacto</h4>
                <div className="tb-info-list">
                  <div className="tb-info-row"><span className="tb-info-label">Correo:</span><a href={`mailto:${postulante.email}`} className="tb-info-val link">{postulante.email}</a></div>
                  <div className="tb-info-row"><span className="tb-info-label">Teléfono:</span><span className="tb-info-val">{postulante.telefono || 'No disponible'}</span></div>
                  <div className="tb-info-row"><span className="tb-info-label">Ciudad:</span><span className="tb-info-val">{postulante.ciudad || 'No disponible'}</span></div>
                  <div className="tb-info-row"><span className="tb-info-label">Cédula:</span><span className="tb-info-val">{postulante.documento_identidad || 'No disponible'}</span></div>
                  <div className="tb-info-row"><span className="tb-info-label">Fecha:</span><span className="tb-info-val">{new Date(postulante.fecha_postulacion).toLocaleString('es-BO')}</span></div>
                </div>
              </div>
              <div className="tb-detail-section">
                <h4>Perfil profesional</h4>
                <div className="tb-info-list">
                  <div className="tb-info-row"><span className="tb-info-label">Experiencia:</span><span className="tb-info-val">{postulante.experiencia_anios} años</span></div>
                  <div className="tb-info-row"><span className="tb-info-label">Nivel educativo:</span><span className="tb-info-val">{postulante.educacion || 'No disponible'}</span></div>
                  <div className="tb-info-row"><span className="tb-info-label">Seguimiento:</span><span className="tb-info-val">{postulante.codigo_seguimiento}</span></div>
                  {postulante.linkedin && <div className="tb-info-row"><span className="tb-info-label">LinkedIn:</span><a className="tb-info-val link" href={postulante.linkedin} target="_blank" rel="noreferrer">Ver perfil</a></div>}
                </div>
              </div>
            </div>

            <div className="tb-notes-section">
              <h4>Notas del equipo ({notas.length})</h4>
              <div className="tb-add-note-box">
                <textarea className="tb-textarea" rows={2} value={nuevaNota} onChange={(event) => setNuevaNota(event.target.value)} placeholder="Escribe una nota interna..." />
                <button type="button" className="tb-btn tb-btn-primary" disabled={saving || !nuevaNota.trim()} onClick={() => void agregarNota()}>{saving ? 'Guardando...' : 'Agregar nota'}</button>
              </div>
              <div className="tb-notes-timeline">
                {notas.length === 0 ? <p className="tb-empty-notes">No hay notas registradas.</p> : notas.map((nota) => (
                  <div key={nota.id} className="tb-note-item"><div className="tb-note-header"><span className="tb-note-author">{nota.autor}</span><span className="tb-note-date">{new Date(nota.created_at).toLocaleString('es-BO')}</span></div><p className="tb-note-text">{nota.contenido}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RechazarPostulanteModal
        postulante={showRechazoModal ? postulante : null}
        empresaId={empresaId}
        onClose={() => setShowRechazoModal(false)}
        onSuccess={async () => { await onUpdated(); onClose() }}
      />
    </>
  )
}
