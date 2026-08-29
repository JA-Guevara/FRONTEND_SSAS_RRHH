import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
      <div className="vac-eyebrow">Reclutamiento · Sprint 1</div>
      <h1>{id ? 'Editar vacante' : 'Nueva vacante'}</h1>
      <p className="vac-sub">Campos del contrato. El departamento se completa al elegir el cargo.</p>
      {error && <div className="vac-bad">{error}</div>}
      <VacanteForm cargos={cargos} vacante={vacante} />
    </div>
  )
}