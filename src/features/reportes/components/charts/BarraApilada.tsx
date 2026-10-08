import { useState } from 'react'
import { BarChart3, Table as TableIcon } from 'lucide-react'

export type StackedSegment = {
  etiqueta: string
  valor: number
}

type BarraApiladaProps = {
  items: StackedSegment[]
}

const SERIES_COLORS = ['var(--serie-1)', 'var(--serie-2)', 'var(--serie-3)']

export function BarraApilada({ items }: BarraApiladaProps) {
  const [showTable, setShowTable] = useState(false)
  const total = items.reduce((acc, curr) => acc + curr.valor, 0)

  if (items.length === 0 || total === 0) {
    return <div className="inline-empty"><span>Sin datos de distribución.</span></div>
  }

  const chartWidth = 480
  const barHeight = 36
  const y = 30
  const gap = 2

  let accumulatedX = 0

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
          {showTable ? <BarChart3 size={14} aria-hidden="true" /> : <TableIcon size={14} aria-hidden="true" />}
          <span>{showTable ? 'Gráfico' : 'Tabla'}</span>
        </button>
      </div>

      {showTable ? (
        <div className="report-chart-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estado / Categoría</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const pct = ((item.valor / total) * 100).toFixed(1)
                return (
                  <tr key={idx}>
                    <td>{item.etiqueta}</td>
                    <td>{item.valor.toLocaleString()}</td>
                    <td>{pct} %</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <svg
            className="report-chart-svg"
            viewBox={`0 0 ${chartWidth} 100`}
            role="img"
            aria-label="Gráfico de barra apilada horizontal"
          >
            {items.map((item, index) => {
              const segWidth = Math.max(((item.valor / total) * (chartWidth - items.length * gap)), 2)
              const currentX = accumulatedX
              accumulatedX += segWidth + gap
              const color = SERIES_COLORS[index % SERIES_COLORS.length]
              const pct = Math.round((item.valor / total) * 100)

              return (
                <g key={index}>
                  <rect
                    x={currentX}
                    y={y}
                    width={segWidth}
                    height={barHeight}
                    rx={3}
                    fill={color}
                  />
                  {segWidth > 32 && (
                    <text
                      x={currentX + segWidth / 2}
                      y={y + 22}
                      textAnchor="middle"
                      fill="var(--paper)"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {pct}%
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Leyenda directa con muestras de color */}
          <div className="report-chart-legend">
            {items.map((item, index) => {
              const swatchClass = `report-chart-legend-swatch report-swatch-${(index % 3) + 1}`
              const pct = ((item.valor / total) * 100).toFixed(1)
              return (
                <div key={index} className="report-chart-legend-item">
                  <span className={swatchClass} />
                  <span>
                    <strong>{item.etiqueta}</strong>: {item.valor} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
