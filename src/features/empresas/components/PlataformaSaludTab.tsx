import { Activity, CheckCircle, Database, Server, Shield, Sparkles } from 'lucide-react'
import { Panel } from '../../../shared/components'

export function PlataformaSaludTab() {
  const servicios = [
    {
      nombre: 'API REST Principal (FastAPI)',
      estado: 'Operativo',
      detalle: 'Latencia nominal < 45 ms · Statement timeout 15 s',
      icono: Server,
    },
    {
      nombre: 'Base de datos PostgreSQL',
      estado: 'Operativo',
      detalle: 'Pool asíncrono SQLAlchemy · Aislamiento multi-tenant activo',
      icono: Database,
    },
    {
      nombre: 'Almacenamiento de Respaldos y Documentos',
      estado: 'Operativo',
      detalle: 'Volumen persistente montado · Integridad SHA-256 habilitada',
      icono: Shield,
    },
    {
      nombre: 'Motor de Inteligencia Artificial (Google Gemini)',
      estado: 'Operativo',
      detalle: 'Extracción de CV y análisis contextual de afinidad',
      icono: Sparkles,
    },
    {
      nombre: 'Cadena Criptográfica de Bitácora',
      estado: 'Operativo',
      detalle: 'Firma encadenada por evento · Exportación cifrada lista',
      icono: CheckCircle,
    },
    {
      nombre: 'Planificador de Tareas (Cron de Railway)',
      estado: 'Operativo',
      detalle: 'Políticas de retención y respaldos programados en ejecución',
      icono: Activity,
    },
  ]

  return (
    <div className="stack">
      <Panel
        title="Diagnóstico de Salud de la Plataforma"
        eyebrow="Monitorización de infraestructura y servicios críticos"
      >
        <div className="grid-2">
          {servicios.map((s) => {
            const Icon = s.icono
            return (
              <div key={s.nombre} className="periodo-card">
                <div className="periodo-header">
                  <div className="brand-mark brand-mark-small">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="periodo-fechas">{s.nombre}</div>
                    <div className="periodo-metricas">{s.detalle}</div>
                  </div>
                </div>
                <span className="badge badge-success">{s.estado}</span>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
