import { useEffect, useState } from 'react'
import { Building2, Users, HardDrive, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react'
import { empresasApi, type ResumenPlataforma } from '../api/empresasApi'
import { Alert, EmptyState, Panel, Skeleton } from '../../../shared/components'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function PlataformaResumenTab() {
  const [data, setData] = useState<ResumenPlataforma | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    empresasApi
      .getResumenPlataforma()
      .then((res) => {
        if (active) {
          setData(res)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar el resumen.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="stack">
        <Skeleton rows={4} variant="rect" />
        <Skeleton rows={6} variant="table" />
      </div>
    )
  }

  if (error) {
    return <Alert tone="error">{error}</Alert>
  }

  if (!data) return null

  return (
    <div className="stack">
      {/* Tarjetas de métricas principales */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Empresas clientes</span>
            <Building2 size={20} className="text-muted" aria-hidden="true" />
          </div>
          <div className="stat-card-value">{data.empresas_activas + data.empresas_suspendidas}</div>
          <div className="stat-card-sub text-muted">
            {data.empresas_activas} activas · {data.empresas_suspendidas} suspendidas
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Usuarios totales</span>
            <Users size={20} className="text-muted" aria-hidden="true" />
          </div>
          <div className="stat-card-value">{data.usuarios_totales}</div>
          <div className="stat-card-sub text-muted">Registrados en la plataforma</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Almacenamiento de respaldos</span>
            <HardDrive size={20} className="text-muted" aria-hidden="true" />
          </div>
          <div className="stat-card-value">{formatBytes(data.almacenamiento_bytes)}</div>
          <div className="stat-card-sub text-muted">En volumen persistente</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Respaldos (24h)</span>
            <ShieldCheck size={20} className="text-muted" aria-hidden="true" />
          </div>
          <div className="stat-card-value">{data.respaldos_ultimas_24h}</div>
          <div className="stat-card-sub text-muted">Ejecuciones recientes</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Consumo de IA (Mes)</span>
            <Sparkles size={20} className="text-muted" aria-hidden="true" />
          </div>
          <div className="stat-card-value">{data.analisis_cv_del_mes}</div>
          <div className="stat-card-sub text-muted">Currículums analizados con Gemini</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Incidentes / Errores (24h)</span>
            <AlertTriangle size={20} className="text-muted" aria-hidden="true" />
          </div>
          <div className="stat-card-value">{data.errores_ultimas_24h}</div>
          <div className="stat-card-sub text-muted">Eventos de advertencia o falla</div>
        </div>
      </div>

      {/* Bitácora de eventos recientes de toda la plataforma */}
      <Panel title="Actividad global reciente" count={`${data.eventos_recientes.length} eventos`}>
        {data.eventos_recientes.length === 0 ? (
          <EmptyState title="Sin actividad reciente" message="No se han registrado eventos en las últimas 24 horas." />
        ) : (
          <div className="table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Nivel</th>
                  <th>Descripción</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {data.eventos_recientes.map((ev) => (
                  <tr key={ev.id}>
                    <td>{new Date(ev.created_at).toLocaleString('es-BO')}</td>
                    <td><code>{ev.modulo}</code></td>
                    <td><strong>{ev.accion}</strong></td>
                    <td><span className={`badge ${ev.nivel === 'ERROR' || ev.nivel === 'CRITICAL' ? 'badge-danger' : 'badge-neutral'}`}>{ev.nivel}</span></td>
                    <td>{ev.descripcion}</td>
                    <td>{ev.actor_etiqueta ?? 'Sistema'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
