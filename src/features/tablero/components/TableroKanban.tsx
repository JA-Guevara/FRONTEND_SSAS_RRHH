import { useState } from 'react'
import { moverPostulacion, type Etapa, type PostulanteDetalle } from '../api/tableroApi'
import { PostulanteDetalleModal } from './PostulanteDetalleModal'

type Props = {
  etapas: Etapa[]
  postulaciones: PostulanteDetalle[]
  empresaId?: string
  onChanged: () => Promise<void>
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO')
}

export function TableroKanban({ etapas, postulaciones, empresaId, onChanged }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overEtapa, setOverEtapa] = useState<string | null>(null)
  const [selectedPostulante, setSelectedPostulante] = useState<PostulanteDetalle | null>(null)
  const [error, setError] = useState('')

  async function mover(id: string, etapaId: string) {
    setError('')
    try {
      await moverPostulacion(id, etapaId, empresaId)
      await onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la etapa')
    }
  }

  return (
    <>
      {error && <div className="vac-bad" role="alert">{error}</div>}
      <div className="tb-board">
        {etapas.map((etapa) => {
          const cards = postulaciones.filter((postulacion) => postulacion.etapa_id === etapa.id)
          return (
            <section
              key={etapa.id}
              className={`tb-col ${overEtapa === etapa.id ? 'over' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setOverEtapa(etapa.id) }}
              onDragLeave={() => setOverEtapa(null)}
              onDrop={(event) => {
                event.preventDefault()
                const postulacionId = event.dataTransfer.getData('text/plain') || draggingId
                setOverEtapa(null)
                setDraggingId(null)
                if (postulacionId) void mover(postulacionId, etapa.id)
              }}
            >
              <h4><span>{etapa.nombre}</span><span className="tb-count">{cards.length}</span></h4>
              <div className="tb-cards-list">
                {cards.map((card) => (
                  <article
                    key={card.id}
                    className={`tb-card ${card.estado === 'DESCARTADA' ? 'rejected' : ''}`}
                    draggable
                    onDragStart={(event) => {
                      setDraggingId(card.id)
                      event.dataTransfer.setData('text/plain', card.id)
                    }}
                    onClick={() => setSelectedPostulante(card)}
                  >
                    <div className="tb-card-top">
                      <b>{card.nombre_postulante}</b>
                      {card.estado === 'DESCARTADA' && <span className="tb-card-pill danger">Descartado</span>}
                    </div>
                    <small className="tb-card-date">
                      {formatFecha(card.fecha_postulacion)}{card.ciudad ? ` · ${card.ciudad}` : ''}
                    </small>
                    <div className="tb-card-meta">
                      <span className="tb-card-score">
                        {card.puntaje_manual == null ? 'Sin puntaje' : `${card.puntaje_manual}/100`}
                      </span>
                    </div>
                    <div className="tb-moves" onClick={(event) => event.stopPropagation()}>
                      {etapas.filter((item) => item.id !== etapa.id).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => void mover(card.id, item.id)}
                          title={`Mover a ${item.nombre}`}
                        >
                          → {item.nombre}
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

      <PostulanteDetalleModal
        postulante={selectedPostulante}
        etapas={etapas}
        empresaId={empresaId}
        onClose={() => setSelectedPostulante(null)}
        onUpdated={async () => {
          setSelectedPostulante(null)
          await onChanged()
        }}
      />
    </>
  )
}
