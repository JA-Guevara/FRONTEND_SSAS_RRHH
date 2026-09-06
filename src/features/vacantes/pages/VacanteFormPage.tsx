import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VacanteForm } from '../components/VacanteForm'
import { getCargosOpcion, getVacante, type CargoOpcion, type Vacante } from '../api/vacantesApi'
import '../vacantes.css'

export function VacanteFormPage() {
  const { id } = useParams()
  const [cargos, setCargos] = useState<CargoOpcion[]>([])
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void getCargosOpcion().then(setCargos)
    if (id) {
      void getVacante(Number(id))
        .then(setVacante)
        .catch((err: Error) => setError(err.message))
    }
  }, [id])

  return (
    <div className="vac-page">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/vacantes" className="tb-back-link">
          ‹ Volver a Vacantes
        </Link>
      </div>

      <div className="vac-eyebrow">Reclutamiento · Sprint 1</div>
      <h1>{id ? 'Editar vacante' : 'Nueva vacante'}</h1>
      <p className="vac-sub">
        Completa los datos de la vacante. El departamento se asigna automáticamente según el cargo seleccionado.
      </p>

      {error && <div className="vac-bad">{error}</div>}
      <VacanteForm cargos={cargos} vacante={vacante} />
    </div>
  )
}