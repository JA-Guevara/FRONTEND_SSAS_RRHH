import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import {
  Button,
  DataTable,
  EmptyState,
  EstadoBadge,
  Field,
  PageHeader,
  Pagination,
} from '../../../shared/components'
import {
  listarEmpleados,
  nombreCompleto,
  type EmpleadoListItem,
} from '../api/empleadosApi'
import { EmpleadoDetalleModal } from '../components/EmpleadoDetalleModal'
import { formatearFecha } from '../../portal/utils/formato'

export function EmpleadosPage() {
  const { selectedCompanyId } = useCompanyScope()
  return <Empleados key={selectedCompanyId} empresaId={selectedCompanyId ?? undefined} />
}

function Empleados({ empresaId }: { empresaId?: string }) {
  const [items, setItems] = useState<EmpleadoListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [detalleId, setDetalleId] = useState<string | null>(null)

  const perPage = 10

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    listarEmpleados(empresaId, {
      q: q.trim() || undefined,
      estado: estado || undefined,
      offset: (page - 1) * perPage,
      limit: perPage,
    })
      .then((data) => {
        if (active) {
          setItems(data.items)
          setTotal(data.total)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el listado de empleados.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [empresaId, q, estado, page, reload])

  return (
    <section className="page-stack">
      <PageHeader title="Empleados" eyebrow="Organización" />

      <div className="toolbar" role="group" aria-label="Filtros de empleados">
        <Field label="Buscar">
          <input
            type="search"
            value={q}
            maxLength={120}
            placeholder="Nombre, apellido o código..."
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="Estado">
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todos</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="BAJA">BAJA</option>
          </select>
        </Field>
      </div>

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Sin empleados"
          message="Todavía no hay empleados registrados."
        />
      ) : (
        <>
          <DataTable
            rows={items}
            rowKey={(e) => e.id}
            loading={loading}
            error={error}
            onRetry={() => setReload((n) => n + 1)}
            columns={[
              {
                key: 'codigo',
                header: 'Código',
                render: (e) => e.codigo,
              },
              {
                key: 'empleado',
                header: 'Empleado',
                render: (e) => <strong>{nombreCompleto(e)}</strong>,
              },
              {
                key: 'cargo',
                header: 'Cargo',
                render: (e) => e.cargo_nombre ?? 'Sin información',
              },
              {
                key: 'fecha_ingreso',
                header: 'Fecha de ingreso',
                render: (e) => formatearFecha(e.fecha_ingreso) ?? e.fecha_ingreso,
              },
              {
                key: 'estado',
                header: 'Estado',
                render: (e) => <EstadoBadge estado={e.estado} />,
              },
              {
                key: 'acciones',
                header: 'Acciones',
                render: (e) => (
                  <Button
                    variant="ghost"
                    title="Ver ficha"
                    aria-label="Ver ficha"
                    onClick={() => setDetalleId(e.id)}
                  >
                    <Eye size={16} />
                  </Button>
                ),
              },
            ]}
          />

          {!error && total > 0 && (
            <Pagination
              page={page}
              perPage={perPage}
              total={total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {detalleId && (
        <EmpleadoDetalleModal
          empleadoId={detalleId}
          empresaId={empresaId}
          onClose={() => setDetalleId(null)}
        />
      )}
    </section>
  )
}
