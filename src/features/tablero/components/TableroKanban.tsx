import { useState } from 'react'
import type { Etapa, PostulanteDetalle } from '../api/tableroApi'
import { moverPostulacion } from '../api/tableroApi'
import { PostulanteDetalleModal } from './PostulanteDetalleModal'

type Props = {
  etapas: Etapa[]
  postulaciones: PostulanteDetalle[]
  onChanged: () => Promise<void>
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO')
}

export function TableroKanban({ etapas, postulaciones, onChanged }: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [overEtapa, setOverEtapa] = useState<number | null>(null)
  const [selectedPostulante, setSelectedPostulante] = useState<PostulanteDetalle | null>(null)

  async function mover(id: number, etapaId: number) {
    await moverPostulacion(id, etapaId)
    await onChanged()
  }

  return (
    <>
      <div className="tb-board">
        {etapas.map((etapa) => {
          const cards = postulaciones.filter((p) => p.etapa_id === etapa.id)
          return (
            <section
              key={etapa.id}
              className={`tb-col ${overEtapa === etapa.id ? 'over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setOverEtapa(etapa.id)
              }}
              onDragLeave={() => setOverEtapa(null)}
              onDrop={async (e) => {
                e.preventDefault()
                const id = Number(e.dataTransfer.getData('text/plain') || draggingId)
                setOverEtapa(null)
                setDraggingId(null)
                if (id) await mover(id, etapa.id)
              }}
            >
              <h4>
                <span>{etapa.nombre}</span>
                <span className="tb-count">{cards.length}</span>
              </h4>

              <div className="tb-cards-list">
                {cards.map((card) => (
                  <article
                    key={card.id}
                    className={`tb-card ${card.estado === 'RECHAZADO' ? 'rejected' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(card.id)
                      e.dataTransfer.setData('text/plain', String(card.id))
                    }}
                    onClick={() => setSelectedPostulante(card)}
                  >
                    <div className="tb-card-top">
                      <b>{card.nombre_postulante}</b>
                      {card.estado === 'RECHAZADO' && (
                        <span className="tb-card-pill danger">Rechazado</span>
                      )}
                    </div>

                    <small className="tb-card-date">{formatFecha(card.fecha_postulacion)} · {card.ciudad}</small>

                    <div className="tb-card-meta">
                      <span className="tb-card-score">
                        ⭐ {card.puntaje_manual != null ? `${card.puntaje_manual}/100` : '—'}
                      </span>
                      {card.notas.length > 0 && (
                        <span className="tb-card-notes-count">
                          💬 {card.notas.length}
                        </span>
                      )}
                    </div>

                    <div className="tb-moves" onClick={(e) => e.stopPropagation()}>
                      {etapas
                        .filter((e) => e.id !== etapa.id)
                        .map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => void mover(card.id, e.id)}
                            title={`Mover a ${e.nombre}`}
                          >
                            → {e.nombre}
                          </button>
                        ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Modal de Detalle de Postulante (T1-16) */}
      <PostulanteDetalleModal
        postulante={selectedPostulante}
        etapas={etapas}
        onClose={() => setSelectedPostulante(null)}
        onUpdated={async () => {
          await onChanged()
          if (selectedPostulante) {
            const up = postulaciones.find((p) => p.id === selectedPostulante.id)
            if (up) setSelectedPostulante(up)
          }
        }}
      />
    </>
  )
}