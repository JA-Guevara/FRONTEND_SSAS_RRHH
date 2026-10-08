import { useState } from 'react'
import { Filter as FilterIcon, Table as TableIcon } from 'lucide-react'

export type FunnelStage = {
  etiqueta: string
  valor: number
}

type EmbudoProps = {
  items: FunnelStage[]
}

const RAMPA_FILLS = [
  'var(--brand-900)',
  'var(--brand-800)',
  'var(--brand-700)',
  'var(--brand-600)',
  'var(--brand-500)',
]

export function Embudo({ items }: EmbudoProps) {
  const [showTable, setShowTable] = useState(false)
  const initialValue = items[0]?.valor || 1

  if (items.length === 0) {
    return <div className="inline-empty"><span>Sin datos de embudo.</span></div>
  }

  const chartWidth = 460
  const rowHeight = 36
  const labelWidth = 140
  const maxBarWidth = chartWidth - labelWidth - 80
  const svgHeight = items.length * rowHeight + 20

  return (
    <div className="report-chart-container">
      <div className="report-widget-actions">
        <button
          type="button"
          className="report-filter-chip"
          onClick={() => setShowTable((prev) => !prev)}
          title={showTable ? 'Ver gráfico' : 'Ver datos en tabla'}
          aria-label={showTable ? 'Ver gráfico' : 'Ver datos en tabla'}
        >
          {showTable ? <FilterIcon size={14} aria-hidden="true" /> : <TableIcon size={14} aria-hidden="true" />}
          <span>{showTable ? 'Gráfico' : 'Tabla'}</span>
        </button>
      </div>

      {showTable ? (
        <div className="report-chart-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Candidatos</th>
                <th>Conversión desde inicio</th>
              </tr>
            </thead>
            <tbody>
              {items.map((stage, idx) => {
                const conv = ((stage.valor / initialValue) * 100).toFixed(1)
                return (
                  <tr key={idx}>
                    <td>{stage.etiqueta}</td>
                    <td>{stage.valor.toLocaleString()}</td>
                    <td>{conv} %</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <svg
          className="report-chart-svg"
          viewBox={`0 0 ${chartWidth} ${svgHeight}`}
          role="img"
          aria-label="Embudo de selección"
        >
          {items.map((stage, index) => {
            const barWidth = Math.max((stage.valor / initialValue) * maxBarWidth, 6)
            const y = index * rowHeight + 10
            const fill = RAMPA_FILLS[index % RAMPA_FILLS.length]
            const conv = Math.round((stage.valor / initialValue) * 100)

            return (
              <g key={index}>
                <text
                  x={labelWidth - 10}
                  y={y + 16}
                  textAnchor="end"
                  fill="var(--ink-2)"
                  fontSize="12"
                  fontWeight="500"
                >
                  {stage.etiqueta.length > 18 ? `${stage.etiqueta.slice(0, 17)}…` : stage.etiqueta}
                </text>
                <rect
                  x={labelWidth}
                  y={y + 4}
                  width={barWidth}
                  height={20}
                  rx={3}
                  fill={fill}
                />
                <text
                  x={labelWidth + barWidth + 8}
                  y={y + 18}
                  fill="var(--ink)"
                  fontSize="12"
                  fontWeight="600"
                >
                  {stage.valor} ({conv}%)
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
