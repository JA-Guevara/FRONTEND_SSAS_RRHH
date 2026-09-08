import { useState } from 'react'
import {
  publicarVacante,
  pausarVacante,
  cerrarVacante,
  type VacanteListItem,
} from '../api/vacantesApi'
import { ApiError } from '../../../shared/api/httpClient'

export type AccionVacante = 'publicar' | 'pausar' | 'cerrar'

type Props = {
  vacante: VacanteListItem | null
  accion: AccionVacante | null
  onClose: () => void
  onSuccess: () => Promise<void> | void
  onEditar?: (id: string) => void
<<<<<<< HEAD
  empresaId?: string
=======
>>>>>>> 2d47e47 (mejoras en sprint 1)
}

export function ConfirmarAccionVacanteModal({
  vacante,
  accion,
  onClose,
  onSuccess,
  onEditar,
  empresaId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error422, setError422] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  if (!vacante || !accion) return null

  const config = {
    publicar: {
      titulo: 'Publicar vacante',
      descripcion: `¿Deseas publicar la vacante "${vacante.titulo}"? Pasará a estar activa y visible para postulantes.`,
      btnTexto: 'Confirmar y Publicar',
      btnClase: 'vac-btn-primary',
      icono: '📢',
    },
    pausar: {
      titulo: 'Pausar vacante',
      descripcion: `¿Deseas pausar la vacante "${vacante.titulo}"? Dejará de aparecer temporalmente en el portal público.`,
      btnTexto: 'Pausar vacante',
      btnClase: 'vac-btn-warning',
      icono: '⏸️',
    },
    cerrar: {
      titulo: 'Cerrar vacante',
      descripcion: `¿Deseas cerrar la vacante "${vacante.titulo}"? Se finalizará la recepción de postulaciones.`,
      btnTexto: 'Cerrar vacante',
      btnClase: 'vac-btn-danger',
      icono: '🔒',
    },
  }[accion]

  async function handleConfirm() {
    if (!vacante || !accion) return
    setLoading(true)
    setError422(null)
    setErrorGeneral(null)

    try {
      if (accion === 'publicar') await publicarVacante(vacante.id, empresaId)
      if (accion === 'pausar') await pausarVacante(vacante.id, empresaId)
      if (accion === 'cerrar') await cerrarVacante(vacante.id, empresaId)
      await onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 422) {
        setError422(err.message || 'Error 422: La vacante no cumple los requisitos para ser publicada.')
      } else if (err instanceof Error) {
        setErrorGeneral(err.message)
      } else {
        setErrorGeneral('Ocurrió un error inesperado al procesar la acción.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vac-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="vac-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="vac-modal-header">
          <div className="vac-modal-icon">{config.icono}</div>
          <div>
            <h3>{config.titulo}</h3>
            <span className="vac-modal-sub">Código #{vacante.id} · {vacante.departamento_nombre}</span>
          </div>
          <button className="vac-modal-close" onClick={onClose} type="button" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="vac-modal-body">
          <p>{config.descripcion}</p>

          <div className="vac-summary-box">
            <div><strong>Cargo:</strong> {vacante.cargo_nombre}</div>
            <div><strong>Modalidad:</strong> {vacante.modalidad} ({vacante.ubicacion})</div>
            <div><strong>Vacantes disponibles:</strong> {vacante.cantidad_vacantes}</div>
            <div><strong>Fecha de cierre:</strong> {vacante.fecha_cierre}</div>
          </div>

          {error422 && (
            <div className="vac-alert-422">
              <div className="vac-alert-title">
                ⚠️ Error 422: Validación de publicación
              </div>
              <p className="vac-alert-msg">{error422}</p>
              {onEditar && (
                <button
                  type="button"
                  className="vac-btn-fix"
                  onClick={() => {
                    onClose()
                    onEditar(vacante.id)
                  }}
                >
                  ✏️ Ir a editar y completar descripción
                </button>
              )}
            </div>
          )}

          {errorGeneral && (
            <div className="vac-bad">
              <strong>Error:</strong> {errorGeneral}
            </div>
          )}
        </div>

        <div className="vac-modal-footer">
          <button
            type="button"
            className="vac-btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`vac-btn ${config.btnClase}`}
            onClick={() => void handleConfirm()}
            disabled={loading}
          >
            {loading ? 'Procesando...' : config.btnTexto}
          </button>
        </div>
      </div>
    </div>
  )
}
