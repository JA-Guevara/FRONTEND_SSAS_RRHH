import { useState } from 'react'
import {
  agregarNotaPostulante,
  actualizarPuntajePostulante,
  descargarCV,
  type Etapa,
  type PostulanteDetalle,
} from '../api/tableroApi'
import { RechazarPostulanteModal } from './RechazarPostulanteModal'

type Props = {
  postulante: PostulanteDetalle | null
  etapas: Etapa[]
  onClose: () => void
  onUpdated: () => Promise<void> | void
}

export function PostulanteDetalleModal({ postulante, etapas, onClose, onUpdated }: Props) {
  const [currentPostulante, setCurrentPostulante] = useState<PostulanteDetalle | null>(postulante)
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [showRechazoModal, setShowRechazoModal] = useState(false)
  const [editingScore, setEditingScore] = useState(false)
  const [nuevoPuntaje, setNuevoPuntaje] = useState<number>(postulante?.puntaje_manual ?? 70)

  if (!postulante) return null
  const p = currentPostulante ?? postulante

  const etapaActual = etapas.find((e) => e.id === p.etapa_id)

  async function handleAgregarNota() {
    if (!nuevaNota.trim()) return
    setGuardandoNota(true)
    try {
      const actualizado = await agregarNotaPostulante(p.id, nuevaNota.trim(), 'Reclutador')
      setCurrentPostulante(actualizado)
      setNuevaNota('')
      await onUpdated()
    } finally {
      setGuardandoNota(false)
    }
  }

  async function handleGuardarPuntaje() {
    try {
      const actualizado = await actualizarPuntajePostulante(p.id, nuevoPuntaje)
      setCurrentPostulante(actualizado)
      setEditingScore(false)
      await onUpdated()
    } catch {
      // ignore
    }
  }

  function handleRechazoExitoso(postulanteRechazado: PostulanteDetalle) {
    setCurrentPostulante(postulanteRechazado)
    void onUpdated()
  }

  return (
    <>
      <div className="tb-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div className="tb-drawer-card" onClick={(e) => e.stopPropagation()}>
          {/* Header del Candidato */}
          <div className="tb-drawer-header">
            <div className="tb-drawer-avatar">
              {p.nombre_postulante.charAt(0).toUpperCase()}
            </div>
            <div className="tb-drawer-title-wrap">
              <div className="tb-drawer-badges">
                {p.estado === 'RECHAZADO' ? (
                  <span className="tb-status-badge rejected">🚫 Rechazado</span>
                ) : p.estado === 'CONTRATADO' ? (
                  <span className="tb-status-badge hired">🎉 Contratado</span>
                ) : (
                  <span className="tb-status-badge in-progress">En proceso</span>
                )}
                <span className="tb-etapa-badge">Etapa: {etapaActual?.nombre ?? 'Sin etapa'}</span>
              </div>
              <h2>{p.nombre_postulante}</h2>
              <span className="tb-vacante-subtitle">Vacante: {p.vacante_titulo}</span>
            </div>
            <button className="tb-modal-close" onClick={onClose} type="button" aria-label="Cerrar">
              ✕
            </button>
          </div>

          <div className="tb-drawer-content">
            {/* Banner si el candidato está rechazado */}
            {p.estado === 'RECHAZADO' && (
              <div className="tb-rejection-banner">
                <div className="tb-rejection-title">
                  ⚠️ Postulación rechazada el {p.fecha_rechazo || 'recientemente'}
                </div>
                <div className="tb-rejection-motive">
                  <strong>Motivo:</strong> {p.motivo_rechazo}
                </div>
                {p.notas_rechazo && (
                  <div className="tb-rejection-notes">
                    <strong>Observaciones:</strong> {p.notas_rechazo}
                  </div>
                )}
              </div>
            )}

            {/* Fila de Acciones Principales y Puntaje */}
            <div className="tb-action-bar">
              <div className="tb-score-box">
                <span className="tb-score-label">Puntaje evaluación:</span>
                {editingScore ? (
                  <div className="tb-score-edit">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nuevoPuntaje}
                      onChange={(e) => setNuevoPuntaje(Number(e.target.value))}
                      className="tb-score-input"
                    />
                    <button type="button" className="tb-btn-score-save" onClick={() => void handleGuardarPuntaje()}>
                      Guardar
                    </button>
                    <button type="button" className="tb-btn-score-cancel" onClick={() => setEditingScore(false)}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="tb-score-display" onClick={() => setEditingScore(true)} title="Clic para editar puntaje">
                    <strong className="tb-score-val">{p.puntaje_manual != null ? `${p.puntaje_manual} / 100` : 'Sin calificar'}</strong>
                    <span className="tb-score-pencil">✏️</span>
                  </div>
                )}
              </div>

              <div className="tb-header-actions">
                {/* Botón Descargar CV (T1-16) */}
                <button
                  type="button"
                  className="tb-btn tb-btn-cv"
                  onClick={() => descargarCV(p)}
                  title="Descargar archivo de CV del candidato"
                >
                  📥 Descargar CV ({p.cv_nombre_archivo})
                </button>

                {/* Botón Rechazar (T1-16) */}
                {p.estado !== 'RECHAZADO' && (
                  <button
                    type="button"
                    className="tb-btn tb-btn-danger-outline"
                    onClick={() => setShowRechazoModal(true)}
                  >
                    🚫 Rechazar candidato
                  </button>
                )}
              </div>
            </div>

            {/* Grid de Datos Completos del Postulante */}
            <div className="tb-details-grid">
              {/* Información Personal y Contacto */}
              <div className="tb-detail-section">
                <h4>Información de Contacto</h4>
                <div className="tb-info-list">
                  <div className="tb-info-row">
                    <span className="tb-info-label">Correo electrónico:</span>
                    <a href={`mailto:${p.email}`} className="tb-info-val link">{p.email}</a>
                  </div>
                  <div className="tb-info-row">
                    <span className="tb-info-label">Teléfono:</span>
                    <a href={`tel:${p.telefono}`} className="tb-info-val link">{p.telefono}</a>
                  </div>
                  <div className="tb-info-row">
                    <span className="tb-info-label">Ubicación / Ciudad:</span>
                    <span className="tb-info-val">{p.ciudad}</span>
                  </div>
                  <div className="tb-info-row">
                    <span className="tb-info-label">Cédula / Documento:</span>
                    <span className="tb-info-val">{p.documento_identidad}</span>
                  </div>
                  <div className="tb-info-row">
                    <span className="tb-info-label">Fecha postulación:</span>
                    <span className="tb-info-val">{p.fecha_postulacion}</span>
                  </div>
                </div>
              </div>

              {/* Perfil Profesional y Expectativa */}
              <div className="tb-detail-section">
                <h4>Perfil Profesional</h4>
                <div className="tb-info-list">
                  <div className="tb-info-row">
                    <span className="tb-info-label">Años de experiencia:</span>
                    <span className="tb-info-val"><strong>{p.experiencia_anios} años</strong></span>
                  </div>
                  <div className="tb-info-row">
                    <span className="tb-info-label">Formación académica:</span>
                    <span className="tb-info-val">{p.educacion}</span>
                  </div>
                  <div className="tb-info-row">
                    <span className="tb-info-label">Expectativa salarial:</span>
                    <span className="tb-info-val text-brand">
                      {p.expectativa_salarial ? `Bs. ${p.expectativa_salarial.toLocaleString()}` : 'A convenir'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Profesional */}
            <div className="tb-detail-section full">
              <h4>Resumen del Candidato</h4>
              <p className="tb-summary-text">{p.resumen_profesional}</p>
            </div>

            {/* Sección de Notas Internas (T1-16) */}
            <div className="tb-notes-section">
              <h4>Notas del Equipo de Reclutamiento ({p.notas.length})</h4>

              {/* Formulario para agregar nueva nota */}
              <div className="tb-add-note-box">
                <textarea
                  className="tb-textarea"
                  rows={2}
                  placeholder="Escribe una observación, resultado de entrevista o nota interna..."
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                />
                <button
                  type="button"
                  className="tb-btn tb-btn-primary"
                  onClick={() => void handleAgregarNota()}
                  disabled={guardandoNota || !nuevaNota.trim()}
                >
                  {guardandoNota ? 'Guardando...' : 'Agregar nota'}
                </button>
              </div>

              {/* Historial de Notas */}
              <div className="tb-notes-timeline">
                {p.notas.length === 0 ? (
                  <p className="tb-empty-notes">Aún no hay notas registradas para este candidato.</p>
                ) : (
                  p.notas.map((nota) => (
                    <div key={nota.id} className="tb-note-item">
                      <div className="tb-note-header">
                        <span className="tb-note-author">{nota.autor}</span>
                        <span className="tb-note-date">{nota.fecha}</span>
                      </div>
                      <p className="tb-note-text">{nota.texto}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Rechazo con Combo de Motivo (T1-16) */}
      <RechazarPostulanteModal
        postulante={showRechazoModal ? p : null}
        onClose={() => setShowRechazoModal(false)}
        onSuccess={handleRechazoExitoso}
      />
    </>
  )
}