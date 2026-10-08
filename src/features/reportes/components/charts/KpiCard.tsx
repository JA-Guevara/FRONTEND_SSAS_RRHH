import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

export type KpiDelta = {
  valor: string
  direccion: 'up' | 'down' | 'equal'
  tono: 'good' | 'bad' | 'neutral'
  etiqueta?: string
}

export type KpiCardProps = {
  title: string
  value: string | number
  delta?: KpiDelta
  subtitulo?: string
}

export function KpiCard({ title, value, delta, subtitulo }: KpiCardProps) {
  return (
    <article className="report-kpi-card" aria-label={title}>
      <span className="report-kpi-title">{title}</span>
      <span className="report-kpi-value">{value}</span>
      {delta && (
        <span className={`report-kpi-delta report-kpi-delta-${delta.tono}`}>
          {delta.direccion === 'up' && <ArrowUp size={12} aria-hidden="true" />}
          {delta.direccion === 'down' && <ArrowDown size={12} aria-hidden="true" />}
          {delta.direccion === 'equal' && <Minus size={12} aria-hidden="true" />}
          <span>{delta.valor}</span>
          {delta.etiqueta && <span>· {delta.etiqueta}</span>}
        </span>
      )}
      {subtitulo && <small className="report-privacy">{subtitulo}</small>}
    </article>
  )
}
