import { useState } from 'react'
import type { Etapa, TarjetaPostulacion } from '../api/tableroApi'
import { moverPostulacion } from '../api/tableroApi'

type Props = {
  etapas: Etapa[]
  postulaciones: TarjetaPostulacion[]
  onChanged: () => Promise<void>
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO')
}

export function TableroKanban({ etapas, postulaciones, onChanged }: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [overEtapa, setOverEtapa] = useState<number | null>(null)

  async function mover(id: number, etapaId: number) {
    await moverPostulacion(id, etapaId)
    await onChanged()
  }

  return (
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
              {etapa.nombre}
              <span className="tb-count">{cards.length}</span>
            </h4>

            {cards.map((card) => (
              <article
                key={card.id}
                className="tb-card"
                draggable
                onDragStart={(e) => {
                  setDraggingId(card.id)
                  e.dataTransfer.setData('text/plain', String(card.id))
                }}
              >
                <b>{card.nombre_postulante}</b>
                <small>{formatFecha(card.fecha_postulacion)}</small>
                <div>
                  <small>Puntaje manual: {card.puntaje_manual ?? '—'}</small>
                </div>
                <div className="tb-moves">
                  {etapas
                    .filter((e) => e.id !== etapa.id)
                    .map((e) => (
                      <button key={e.id} type="button" onClick={() => void mover(card.id, e.id)}>
                        {e.nombre}
                      </button>
                    ))}
                </div>
              </article>
            ))}
          </section>
        )
      })}
    </div>
  )
}