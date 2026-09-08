import { useCallback, useEffect, useState } from 'react'
import { CargosPanel } from '../components/CargosPanel'
import { DepartamentosPanel } from '../components/DepartamentosPanel'
import { getCargos, getDepartamentos, type Cargo, type Departamento } from '../api/organizacionApi'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext.tsx'
import '../organizacion.css'

export function OrganizacionPage() {
  const { company, selectedCompanyId } = useCompanyScope()
  const companyId = company?.id ?? selectedCompanyId ?? undefined
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])

  const load = useCallback(async () => {
    const [deps, cars] = await Promise.all([getDepartamentos(companyId), getCargos(companyId)])
    setDepartamentos(deps)
    setCargos(cars)
  }, [companyId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="org-page">
      <div className="org-eyebrow">Organización · Sprint 1</div>
      <h1>Departamentos y cargos</h1>
      <p className="org-sub">Árbol de departamentos y CRUD de cargos según el modelo de datos.</p>
      <div className="org-grid">
        <DepartamentosPanel departamentos={departamentos} empresaId={companyId} onChanged={load} />
        <CargosPanel cargos={cargos} departamentos={departamentos} empresaId={companyId} onChanged={load} />
      </div>
    </div>
  )
}
