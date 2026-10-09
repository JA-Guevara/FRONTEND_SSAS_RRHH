import { useMemo } from 'react'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

export type EventoLineaTiempo = {
  id?: string
  fecha: string
  titulo: string
  subtitulo?: string
  conteo?: number | null
  tipo?: 'info' | 'warn' | 'error' | 'success'
  detalles?: string
}

type LineaTiempoProps = {
  items: EventoLineaTiempo[]
  titulo?: string
  vacioMensaje?: string
}

export function LineaTiempo({ items, titulo, vacioMensaje }: LineaTiempoProps) {
  const agrupados = useMemo(() => {
    const mapa = new Map<string, EventoLineaTiempo[]>()
    for (const item of items) {
      const fechaClave = item.fecha.length >= 10 ? item.fecha.slice(0, 10) : item.fecha
      const grupo = mapa.get(fechaClave) ?? []
      grupo.push(item)
      mapa.set(fechaClave, grupo)
    }
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [items])

  if (items.length === 0) {
    return (
      <div className="inline-empty">
        <AlertCircle size={16} aria-hidden="true" />
        <span>{vacioMensaje ?? 'Sin eventos registrados para la línea de tiempo.'}</span>
      </div>
    )
  }

  return (
    <div className="report-chart-container" role="feed" aria-label={titulo ?? 'Línea de tiempo de eventos'}>
      {titulo && <h4 className="report-widget-title">{titulo}</h4>}
      <div className="report-timeline">
        {agrupados.map(([fecha, eventos]) => (
          <div key={fecha} className="report-timeline-group">
            <div className="report-timeline-date">
              <Calendar size={13} aria-hidden="true" />
              <span>{fecha}</span>
            </div>
            {eventos.map((ev, idx) => {
              const markerClass =
                ev.tipo === 'warn'
                  ? 'report-timeline-marker report-timeline-marker-warn'
                  : ev.tipo === 'error'
                  ? 'report-timeline-marker report-timeline-marker-error'
                  : 'report-timeline-marker'

              return (
                <div key={ev.id ?? `${fecha}-${idx}`} className="report-timeline-item" role="article">
                  <span className={markerClass} aria-hidden="true" />
                  <div className="report-timeline-header">
                    <strong className="report-timeline-title">{ev.titulo}</strong>
                    {ev.conteo !== undefined && (
                      <span className="report-badge-count">{ev.conteo}</span>
                    )}
                  </div>
                  {ev.subtitulo && (
                    <div className="report-timeline-sub">
                      <Clock size={11} aria-hidden="true" />
                      <span>{ev.subtitulo}</span>
                    </div>
                  )}
                  {ev.detalles && <p className="report-timeline-sub">{ev.detalles}</p>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
