import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Field,
  PageHeader,
  Pagination,
  Panel,
} from '../../../shared/components'
import type { Column } from '../../../shared/components'
import type { components } from '../../../shared/api/schema'
import { AltaEmpresaForm } from '../components/AltaEmpresaForm'
import { empresasApi } from '../api/empresasApi'

type Empresa = components['schemas']['EmpresaResponse']
type AccionPendiente = { empresa: Empresa; tipo: 'suspender' | 'activar' | 'eliminar' | 'restaurar' }

const TITULO_ACCION: Record<AccionPendiente['tipo'], string> = {
  suspender: 'Suspender empresa',
  activar: 'Activar empresa',
  eliminar: 'Eliminar empresa',
  restaurar: 'Restaurar empresa',
}

const DETALLE_ACCION: Record<AccionPendiente['tipo'], string> = {
  suspender: 'Sus usuarios no podrán iniciar sesión hasta que la reactives.',
  activar: 'La empresa vuelve a estar operativa y sus usuarios podrán acceder.',
  eliminar: 'Se desactivan sus usuarios y se revocan las sesiones. Podrás restaurarla después.',
  restaurar: 'La empresa se restaura suspendida: tendrás que activarla para que opere.',
}

export function AltaEmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [search, setSearch] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [incluirEliminadas, setIncluirEliminadas] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [accion, setAccion] = useState<AccionPendiente | null>(null)
  const [ejecutando, setEjecutando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await empresasApi.list({
        search: busqueda,
        incluir_eliminadas: incluirEliminadas,
        page,
        per_page: perPage,
      })
      setEmpresas(resultado.items)
      setTotal(resultado.total)
    } catch (cause) {
      // Un fallo nunca debe verse como «no hay empresas»: son cosas distintas.
      setEmpresas([])
      setError(cause instanceof Error ? cause.message : 'No fue posible consultar las empresas.')
    } finally {
      setLoading(false)
    }
  }, [busqueda, incluirEliminadas, page, perPage])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function confirmarAccion() {
    if (accion === null) return
    setEjecutando(true)
    setErrorAccion(null)
    try {
      const { empresa, tipo } = accion
      if (tipo === 'suspender') await empresasApi.suspend(empresa.id)
      if (tipo === 'activar') await empresasApi.activate(empresa.id)
      if (tipo === 'eliminar') await empresasApi.remove(empresa.id)
      if (tipo === 'restaurar') await empresasApi.restore(empresa.id)
      setAccion(null)
      await cargar()
    } catch (cause) {
      setErrorAccion(cause instanceof Error ? cause.message : 'No se pudo completar la acción.')
    } finally {
      setEjecutando(false)
    }
  }

  const columnas: Column<Empresa>[] = [
    {
      key: 'empresa',
      header: 'Empresa',
      render: (empresa) => (
        <>
          <strong>{empresa.nombre_comercial}</strong>
          <small>{empresa.razon_social}</small>
        </>
      ),
    },
    { key: 'slug', header: 'Slug', render: (empresa) => empresa.slug },
    { key: 'nit', header: 'NIT', render: (empresa) => empresa.nit ?? '—' },
    {
      key: 'estado',
      header: 'Estado',
      render: (empresa) =>
        empresa.eliminado_at != null ? (
          <Badge tone="danger">Eliminada</Badge>
        ) : empresa.activo ? (
          <Badge tone="success">Activa</Badge>
        ) : (
          <Badge tone="warning">Suspendida</Badge>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (empresa) => (
        <div className="row-actions">
          <Link className="button button-ghost button-sm" to={`/empresas/${empresa.id}/modulos`}>
            Módulos
          </Link>
          {empresa.eliminado_at != null ? (
            <Button variant="secondary" size="sm" onClick={() => setAccion({ empresa, tipo: 'restaurar' })}>
              Restaurar
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAccion({ empresa, tipo: empresa.activo ? 'suspender' : 'activar' })}
              >
                {empresa.activo ? 'Suspender' : 'Activar'}
              </Button>
              <Button
                variant="danger-outline"
                size="sm"
                onClick={() => setAccion({ empresa, tipo: 'eliminar' })}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Administración global"
        title="Empresas"
        description="Alta, estado y módulos contratados de cada empresa de la plataforma."
        actions={
          <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cerrar formulario' : 'Nueva empresa'}
          </Button>
        }
      />

      {showForm && (
        <AltaEmpresaForm
          onCreated={() => {
            setShowForm(false)
            void cargar()
          }}
        />
      )}

      <Panel title="Listado" count={`${total} empresa${total === 1 ? '' : 's'}`}>
        <form
          className="filters"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setBusqueda(search)
          }}
        >
          <Field label="Buscar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, razón social o NIT"
            />
          </Field>
          <label className="check-label">
            <input
              type="checkbox"
              checked={incluirEliminadas}
              onChange={(event) => {
                setPage(1)
                setIncluirEliminadas(event.target.checked)
              }}
            />
            Incluir eliminadas
          </label>
          <div className="filters-actions">
            <Button type="submit" variant="secondary">
              Consultar
            </Button>
          </div>
        </form>

        <DataTable
          columns={columnas}
          rows={empresas}
          rowKey={(empresa) => empresa.id}
          loading={loading}
          error={error}
          onRetry={() => void cargar()}
          emptyMessage="No hay empresas registradas todavía."
          caption="Empresas de la plataforma"
        />

        {!loading && error === null && total > 0 && (
          <Pagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value)
              setPage(1)
            }}
          />
        )}
      </Panel>

      {accion !== null && (
        <ConfirmDialog
          title={TITULO_ACCION[accion.tipo]}
          message={
            <>
              <p>
                <strong>{accion.empresa.nombre_comercial}</strong>
              </p>
              <p>{DETALLE_ACCION[accion.tipo]}</p>
            </>
          }
          confirmLabel={TITULO_ACCION[accion.tipo].split(' ')[0]}
          tone={accion.tipo === 'eliminar' || accion.tipo === 'suspender' ? 'danger' : 'primary'}
          loading={ejecutando}
          error={errorAccion}
          onConfirm={() => void confirmarAccion()}
          onCancel={() => {
            setAccion(null)
            setErrorAccion(null)
          }}
        />
      )}
    </section>
  )
}
