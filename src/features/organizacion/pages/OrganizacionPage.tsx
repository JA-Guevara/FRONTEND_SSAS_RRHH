import { useCallback, useEffect, useState } from 'react'
import { CargosSection } from '../components/CargosSection'
import { DepartamentosSection } from '../components/DepartamentosSection'
import { getCargos, getDepartamentos, type Cargo, type Departamento } from '../api/organizacionApi'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { EmptyState, LoadingBlock, PageHeader } from '../../../shared/components'

type Tab = 'departamentos' | 'cargos'

export function OrganizacionPage() {
  const { company, loading: scopeLoading } = useCompanyScope()
  const empresaId = company?.id ?? null

  const [tab, setTab] = useState<Tab>('departamentos')
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (empresaId === null) {
      setDepartamentos([])
      setCargos([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([getDepartamentos(empresaId), getCargos(empresaId)])
      .then(([deps, cars]) => {
        setDepartamentos(deps)
        setCargos(cars)
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos de organización.'),
      )
      .finally(() => setLoading(false))
  }, [empresaId])

  useEffect(() => {
    load()
  }, [load])

  if (scopeLoading) {
    return <LoadingBlock message="Resolviendo empresa activa…" />
  }

  if (empresaId === null) {
    return (
      <div className="page-stack">
        <EmptyState
          title="Selecciona una empresa"
          message="Elige la empresa activa desde el encabezado para administrar su estructura organizativa."
        />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Empresa · Organización"
        title="Organización"
        description="Estructura organizativa (departamentos) y puestos de trabajo (cargos) de la empresa activa."
      />

      <div className="tabs" role="tablist" aria-label="Secciones de organización">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'departamentos'}
          className={tab === 'departamentos' ? 'tab selected' : 'tab'}
          onClick={() => setTab('departamentos')}
        >
          Departamentos ({departamentos.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'cargos'}
          className={tab === 'cargos' ? 'tab selected' : 'tab'}
          onClick={() => setTab('cargos')}
        >
          Cargos ({cargos.length})
        </button>
      </div>

      {tab === 'departamentos' ? (
        <DepartamentosSection
          departamentos={departamentos}
          empresaId={empresaId}
          loading={loading}
          error={error}
          onReload={load}
        />
      ) : (
        <CargosSection
          cargos={cargos}
          departamentos={departamentos}
          empresaId={empresaId}
          loading={loading}
          error={error}
          onReload={load}
        />
      )}
    </div>
  )
}