import { useEffect, useState } from 'react'
import { getDashboardResumen } from '../../features/dashboard/api/dashboardApi'
import { useAuth } from '../../features/auth/hooks/useAuth'
import type { components } from '../../shared/api/schema'
import { useCompanyScope } from '../context/CompanyScopeContext'

type Dashboard = components['schemas']['ResumenDashboardResponse']

export function DashboardPage() {
  const { user } = useAuth()
  const { company } = useCompanyScope()
  const companyId = user?.realm === 'platform' ? company?.id : undefined
  const isPlatform = user?.realm === 'platform' && !companyId
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setData(null)
    setError('')
    void getDashboardResumen(companyId).then((result) => {
      if (active) setData(result)
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el resumen.')
    })
    return () => { active = false }
  }, [companyId])

  const empresa = data?.empresa
  const plataforma = data?.plataforma
  const metricas = isPlatform
    ? [['Empresas activas', plataforma?.empresas_activas ?? 0], ['Empresas suspendidas', plataforma?.empresas_suspendidas ?? 0], ['Usuarios totales', plataforma?.usuarios_totales ?? 0]]
    : [['Usuarios activos', empresa?.usuarios_activos ?? 0], ['Departamentos', empresa?.departamentos ?? 0], ['Cargos', empresa?.cargos ?? 0]]
  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div>
        <p className="eyebrow">Panel principal</p>
        <h1 id="dashboard-title">Hola, {user?.name}</h1>
        <p className="page-description">
          {isPlatform
            ? 'Administra empresas desde los servicios globales de la plataforma.'
            : 'Administra usuarios, roles y eventos de auditoría de tu empresa.'}
        </p>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="card-grid">{metricas.map(([label, value], index) => <article className="card" key={label}><span className="card-number">{String(index + 1).padStart(2, '0')}</span><h2>{label}</h2><p className="dashboard-metric">{value}</p></article>)}</div>
      <section className="panel"><div className="panel-heading"><h2>Actividad reciente</h2><span className="panel-count">{data?.bitacora_reciente?.length ?? 0} eventos</span></div><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Módulo</th><th>Acción</th><th>Actor</th></tr></thead><tbody>{data?.bitacora_reciente?.map((item) => <tr key={item.id}><td>{new Date(item.fecha).toLocaleString('es-BO')}</td><td>{item.modulo}</td><td>{item.accion}</td><td>{item.actor ?? 'Sistema'}</td></tr>)}</tbody></table>{data !== null && data.bitacora_reciente?.length === 0 && <div className="empty-table">No hay actividad reciente.</div>}</div></section>
    </section>
  )
}
