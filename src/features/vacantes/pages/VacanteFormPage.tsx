import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, PageHeader } from '../../../shared/components'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { VacanteForm } from '../components/VacanteForm'
import { getCargosOpcion, getVacante, type CargoOpcion, type Vacante } from '../api/vacantesApi'

export function VacanteFormPage() {
  const { id } = useParams()
  const { company } = useCompanyScope()
  const [cargos, setCargos] = useState<CargoOpcion[]>([])
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    void getCargosOpcion(company?.id)
      .then(setCargos)
      .catch((cause: Error) => setError(cause.message))
    if (id) {
      void getVacante(id, company?.id)
        .then(setVacante)
        .catch((cause: Error) => setError(cause.message))
    }
  }, [company?.id, id])

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Reclutamiento y selección"
        title={id ? 'Editar vacante' : 'Nueva vacante'}
        description="Completa los datos de la vacante. El departamento se asigna automáticamente según el cargo seleccionado."
        actions={
          <Link className="button button-secondary" to="/vacantes">
            Volver a vacantes
          </Link>
        }
      />

      {error !== null && <Alert tone="error">{error}</Alert>}

      <VacanteForm cargos={cargos} vacante={vacante} empresaId={company?.id} />
    </section>
  )
}
