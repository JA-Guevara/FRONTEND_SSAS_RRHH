import { useState } from 'react'
import { LineChart, Table as TableIcon } from 'lucide-react'

export type PointItem = {
  etiqueta: string
  valor: number
}

type LineaProps = {
  items: PointItem[]
  etiquetaMedida?: string
  proyeccion?: boolean
}

export function Linea({ items, etiquetaMedida = 'Valor', proyeccion = true }: LineaProps) {
  const [showTable, setShowTable] = useState(false)
  const [verProyeccion, setVerProyeccion] = useState(proyeccion)

  if (items.length === 0) {
    return <div className="inline-empty"><span>Sin datos para la serie temporal.</span></div>
  }

  const chartWidth = 500
  const chartHeight = 220
  const padLeft = 40
  const padRight = 30
  const padTop = 20
  const padBottom = 35

  const habilitarProyeccion = verProyeccion && items.length >= 3
  let valProyectado = 0
  if (habilitarProyeccion) {
    const n = items.length
    const sumX = (n * (n - 1)) / 2
    const sumY = items.reduce((acc, it) => acc + it.valor, 0)
    const sumXY = items.reduce((acc, it, i) => acc + i * it.valor, 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6
    const denom = n * sumXX - sumX * sumX
    const m = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
    const b = (sumY - m * sumX) / n
    valProyectado = Math.max(0, Math.round(m * n + b))
  }

  const maxVal = Math.max(...items.map((i) => i.valor), habilitarProyeccion ? valProyectado : 0, 1)
  const minVal = 0

  const innerWidth = chartWidth - padLeft - padRight
  const innerHeight = chartHeight - padTop - padBottom

  const totalSteps = habilitarProyeccion ? items.length : items.length - 1
  const stepX = totalSteps > 0 ? innerWidth / totalSteps : innerWidth / 2

  const points = items.map((item, index) => {
    const x = padLeft + index * stepX
    const y = padTop + innerHeight - ((item.valor - minVal) / (maxVal - minVal)) * innerHeight
    return { x, y, item }
  })

  const pathD = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`
  }, '')

  const lastPoint = points[points.length - 1]

  const puntoProyeccion =
    habilitarProyeccion && lastPoint
      ? {
          x: padLeft + items.length * stepX,
          y: padTop + innerHeight - ((valProyectado - minVal) / (maxVal - minVal)) * innerHeight,
          valor: valProyectado,
        }
      : null

  return (
    <div className="report-chart-container">
      <div className="report-widget-actions">
        {items.length >= 3 && (
          <button
            type="button"
            className="report-filter-chip"
            onClick={() => setVerProyeccion((prev) => !prev)}
            title={verProyeccion ? 'Ocultar proyección de tendencia' : 'Calcular proyección lineal'}
            aria-label={verProyeccion ? 'Ocultar proyección' : 'Mostrar proyección'}
          >
            <span>{verProyeccion ? 'Proyección activa' : 'Ver proyección'}</span>
          </button>
        )}
        <button
          type="button"
          className="report-filter-chip"
          onClick={() => setShowTable((prev) => !prev)}
          title={showTable ? 'Ver gráfico' : 'Ver datos en tabla'}
          aria-label={showTable ? 'Ver gráfico' : 'Ver datos en tabla'}
        >
          {showTable ? <LineChart size={14} aria-hidden="true" /> : <TableIcon size={14} aria-hidden="true" />}
          <span>{showTable ? 'Gráfico' : 'Tabla'}</span>
        </button>
      </div>

      {showTable ? (
        <div className="report-chart-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Período</th>
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
              {puntoProyeccion && (
                <tr className="report-row-projection">
                  <td>Próximo período (proyección)</td>
                  <td>{puntoProyeccion.valor.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <svg
          className="report-chart-svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Gráfico de línea temporal"
        >
          {/* Ejes de fondo */}
          <line
            x1={padLeft}
            y1={padTop + innerHeight}
            x2={chartWidth - padRight}
            y2={padTop + innerHeight}
            stroke="var(--line)"
            strokeWidth="1"
          />
          <line
            x1={padLeft}
            y1={padTop}
            x2={chartWidth - padRight}
            y2={padTop}
            stroke="var(--line)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Línea de datos */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Línea punteada de proyección */}
          {puntoProyeccion && lastPoint && (
            <path
              d={`M ${lastPoint.x} ${lastPoint.y} L ${puntoProyeccion.x} ${puntoProyeccion.y}`}
              fill="none"
              stroke="var(--brand-600)"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Puntos y etiquetas */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={idx === points.length - 1 ? 5 : 3.5}
                fill={idx === points.length - 1 ? 'var(--brand-700)' : 'var(--paper)'}
                stroke="var(--brand)"
                strokeWidth="2"
              />
              {(idx === 0 || idx === points.length - 1 || idx % Math.ceil(items.length / 5) === 0) && (
                <text
                  x={pt.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize="11"
                >
                  {pt.item.etiqueta.length > 8 ? pt.item.etiqueta.slice(-5) : pt.item.etiqueta}
                </text>
              )}
            </g>
          ))}

          {/* Punto proyectado */}
          {puntoProyeccion && (
            <g>
              <circle
                cx={puntoProyeccion.x}
                cy={puntoProyeccion.y}
                r="4.5"
                fill="var(--paper)"
                stroke="var(--brand-600)"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              <text
                x={puntoProyeccion.x}
                y={puntoProyeccion.y - 10}
                textAnchor="middle"
                fill="var(--brand-700)"
                fontSize="11"
                fontWeight="700"
              >
                {puntoProyeccion.valor.toLocaleString()} (proy.)
              </text>
              <text
                x={puntoProyeccion.x}
                y={chartHeight - 10}
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="10"
              >
                Próximo
              </text>
            </g>
          )}

          {/* Etiqueta del último valor destacado */}
          {lastPoint && !puntoProyeccion && (
            <text
              x={lastPoint.x}
              y={lastPoint.y - 10}
              textAnchor="middle"
              fill="var(--ink)"
              fontSize="12"
              fontWeight="700"
            >
              {lastPoint.item.valor.toLocaleString()}
            </text>
          )}
        </svg>
      )}
    </div>
  )
}
