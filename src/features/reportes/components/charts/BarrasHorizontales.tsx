import { useState } from 'react'
import { BarChart2, Table as TableIcon } from 'lucide-react'

export type BarItem = {
  etiqueta: string
  valor: number
}

type BarrasHorizontalesProps = {
  items: BarItem[]
  etiquetaMedida?: string
}

export function BarrasHorizontales({ items, etiquetaMedida = 'Valor' }: BarrasHorizontalesProps) {
  const [showTable, setShowTable] = useState(false)
  const maxVal = Math.max(...items.map((i) => i.valor), 1)

  if (items.length === 0) {
    return <div className="inline-empty"><span>Sin datos para mostrar.</span></div>
  }

  const rowHeight = 36
  const labelWidth = 140
  const chartWidth = 460
  const svgHeight = Math.max(items.length * rowHeight + 20, 100)
  const barMaxWidth = chartWidth - labelWidth - 60

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
          {showTable ? <BarChart2 size={14} aria-hidden="true" /> : <TableIcon size={14} aria-hidden="true" />}
          <span>{showTable ? 'Gráfico' : 'Tabla'}</span>
        </button>
      </div>

      {showTable ? (
        <div className="report-chart-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>{etiquetaMedida}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.etiqueta}</td>
                  <td>{item.valor.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <svg
          className="report-chart-svg"
          viewBox={`0 0 ${chartWidth} ${svgHeight}`}
          role="img"
          aria-label="Gráfico de barras horizontales"
        >
          {items.map((item, index) => {
            const barWidth = Math.max((item.valor / maxVal) * barMaxWidth, 4)
            const y = index * rowHeight + 10
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
                  {item.etiqueta.length > 18 ? `${item.etiqueta.slice(0, 17)}…` : item.etiqueta}
                </text>
                <rect
                  x={labelWidth}
                  y={y + 4}
                  width={barWidth}
                  height={18}
                  rx={3}
                  fill="var(--brand-600)"
                />
                <text
                  x={labelWidth + barWidth + 8}
                  y={y + 17}
                  fill="var(--ink)"
                  fontSize="12"
                  fontWeight="600"
                >
                  {item.valor.toLocaleString()}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
