import { useEffect, useState } from 'react'
import {
  Award,
  BriefcaseBusiness,
  Building2,
  Users,
  UsersRound,
} from 'lucide-react'
import { getDashboardResumen } from '../../features/dashboard/api/dashboardApi'
import { useAuth } from '../../features/auth/hooks/useAuth'
import type { components } from '../../shared/api/schema'
import {
  Badge,
  Card,
  DataTable,
  PageHeader,
  Stat,
  type Column,
} from '../../shared/components'

type Dashboard = components['schemas']['ResumenDashboardResponse']
type BitacoraItem = NonNullable<Dashboard['bitacora_reciente']>[number]

export function DashboardPage() {
  const { user } = useAuth()
  const isPlatform = user?.realm === 'platform'
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    void getDashboardResumen()
      .then((result) => {
        if (active) {
          setData(result)
          setError(null)
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No se pudo cargar el resumen.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const empresa = data?.empresa
  const plataforma = data?.plataforma

  const vacantesActivas =
    (empresa?.vacantes_por_estado.PUBLICADA ?? 0) + (empresa?.vacantes_por_estado.PAUSADA ?? 0)
  const totalPostulaciones = Object.values(empresa?.postulaciones_por_etapa ?? {}).reduce(
    (sum, n) => sum + n,
    0,
  )

  const fechaHoy = new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'full',
  }).format(new Date())

  const etapas = Object.entries(empresa?.postulaciones_por_etapa ?? {})
  const maxEtapa = Math.max(...etapas.map(([, v]) => v), 1)

  const vacantesPorEstado = Object.entries(empresa?.vacantes_por_estado ?? {})
  const maxVacantes = Math.max(...vacantesPorEstado.map(([, v]) => v), 1)

  const activityColumns: Column<BitacoraItem>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (row) => (
        <span className="text-sm text-muted">
          {new Date(row.fecha).toLocaleString('es-BO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
    {
      key: 'modulo',
      header: 'Módulo',
      render: (row) => <Badge tone="info">{row.modulo}</Badge>,
    },
    {
      key: 'accion',
      header: 'Acción',
      render: (row) => <strong className="text-sm">{row.accion}</strong>,
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (row) => <span className="text-sm">{row.actor ?? 'Sistema'}</span>,
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Panel principal"
        title={`Hola, ${user?.name ?? 'Usuario'}`}
        subtitle={`Resumen operativo al ${fechaHoy}`}
      />

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {/* Tarjetas Stat principales */}
      <section aria-label="Métricas clave" className="card-grid">
        {isPlatform ? (
          <>
            <Stat
              label="Empresas activas"
              value={plataforma?.empresas_activas ?? (loading ? '—' : 0)}
              tone="success"
              icon={<Building2 size={20} />}
            />
            <Stat
              label="Vacantes publicadas"
              value={plataforma?.vacantes_publicadas ?? (loading ? '—' : 0)}
              tone="brand"
              icon={<BriefcaseBusiness size={20} />}
            />
            <Stat
              label="Postulaciones del mes"
              value={plataforma?.postulaciones_del_mes ?? (loading ? '—' : 0)}
              tone="default"
              icon={<Users size={20} />}
            />
            <Stat
              label="Usuarios totales"
              value={plataforma?.usuarios_totales ?? (loading ? '—' : 0)}
              tone="warning"
              icon={<UsersRound size={20} />}
            />
          </>
        ) : (
          <>
            <Stat
              label="Vacantes activas"
              value={vacantesActivas}
              tone="brand"
              icon={<BriefcaseBusiness size={20} />}
            />
            <Stat
              label="Total postulaciones"
              value={totalPostulaciones}
              tone="success"
              icon={<Users size={20} />}
            />
            <Stat
              label="Usuarios activos"
              value={empresa?.usuarios_activos ?? (loading ? '—' : 0)}
              tone="default"
              icon={<UsersRound size={20} />}
            />
            <Stat
              label="Cargos definidos"
              value={empresa?.cargos ?? (loading ? '—' : 0)}
              tone="warning"
              icon={<Award size={20} />}
            />
          </>
        )}
      </section>

      {/* Gráficos visuales SVG */}
      {!isPlatform && (
        <section aria-label="Gráficos del proceso" className="grid-2">
          {/* Embudo de postulaciones */}
          <Card title="Embudo de selección" subtitle={`${totalPostulaciones} candidatos en proceso`}>
            {etapas.length === 0 ? (
              <p className="text-muted text-sm">Sin postulaciones registradas aún.</p>
            ) : (
              <div className="stack-sm">
                {etapas.map(([etapa, cantidad]) => {
                  const pct = Math.round((cantidad / maxEtapa) * 100)
                  return (
                    <div key={etapa} className="stack-sm">
                      <div className="row-between text-sm">
                        <span className="text-strong">{etapa}</span>
                        <span className="text-muted">{cantidad}</span>
                      </div>
                      <svg width="100%" height="10" role="img" aria-label={`${etapa}: ${cantidad}`}>
                        <rect width="100%" height="10" rx="5" fill="var(--surface-2)" />
                        <rect
                          width={`${pct}%`}
                          height="10"
                          rx="5"
                          fill="var(--brand)"
                        />
                      </svg>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Vacantes por estado */}
          <Card title="Vacantes por estado" subtitle="Distribución en los procesos">
            {vacantesPorEstado.length === 0 ? (
              <p className="text-muted text-sm">Sin vacantes registradas.</p>
            ) : (
              <div className="stack-sm">
                {vacantesPorEstado.map(([estado, cantidad]) => {
                  const pct = Math.round((cantidad / maxVacantes) * 100)
                  const toneColor =
                    estado === 'PUBLICADA'
                      ? 'var(--brand)'
                      : estado === 'PAUSADA'
                      ? 'var(--warning)'
                      : estado === 'CERRADA'
                      ? 'var(--muted)'
                      : 'var(--brand-500)'
                  return (
                    <div key={estado} className="stack-sm">
                      <div className="row-between text-sm">
                        <span className="text-strong">{estado}</span>
                        <span className="text-muted">{cantidad}</span>
                      </div>
                      <svg width="100%" height="10" role="img" aria-label={`${estado}: ${cantidad}`}>
                        <rect width="100%" height="10" rx="5" fill="var(--surface-2)" />
                        <rect
                          width={`${pct}%`}
                          height="10"
                          rx="5"
                          fill={toneColor}
                        />
                      </svg>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Actividad reciente */}
      <Card
        title="Actividad reciente"
        subtitle={`${data?.bitacora_reciente?.length ?? 0} eventos registrados en el sistema`}
      >
        <DataTable
          columns={activityColumns}
          rows={data?.bitacora_reciente ?? []}
          rowKey={(r) => r.id}
          loading={loading}
          primaryColumn="accion"
          emptyMessage="No se registra actividad reciente."
        />
      </Card>
    </div>
  )
}