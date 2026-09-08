import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { getVacante, type Vacante } from '../../vacantes/api/vacantesApi'
import {
  getEtapas,
  getPostulaciones,
  type Etapa,
  type PostulanteDetalle,
} from '../api/tableroApi'
import { TableroKanban } from '../components/TableroKanban'
import '../tablero.css'

export function TableroPage() {
  const { id } = useParams()
  const { company } = useCompanyScope()
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [postulaciones, setPostulaciones] = useState<PostulanteDetalle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ets, posts, selectedVacante] = await Promise.all([
        getEtapas(company?.id),
        getPostulaciones(id, company?.id),
        id ? getVacante(id, company?.id) : Promise.resolve(null),
      ])
      setEtapas(ets.sort((a, b) => a.orden - b.orden))
      setVacante(selectedVacante)
      setPostulaciones(posts.map((post) => ({
        ...post,
        vacante_titulo: selectedVacante?.titulo ?? '',
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el tablero')
    } finally {
      setLoading(false)
    }
  }, [company?.id, id])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="tb-page">
      <div className="tb-top-nav">
        <Link to="/vacantes" className="tb-back-link">‹ Volver a Vacantes</Link>
      </div>

      <div className="tb-header-row">
        <div>
          <div className="tb-eyebrow">Reclutamiento & Selección · Sprint 1</div>
          <h1>{vacante ? `Tablero: ${vacante.titulo}` : 'Tablero Kanban de Postulaciones'}</h1>
          <p className="tb-sub">
            {vacante
              ? `Vacantes: ${vacante.cantidad_vacantes} · Modalidad: ${vacante.modalidad} · Total postulantes: ${postulaciones.length}`
              : 'Gestión de candidatos según las etapas de reclutamiento.'}
          </p>
        </div>

        {vacante?.estado === 'BORRADOR' && (
          <div className="tb-vacante-actions">
            <Link to={`/vacantes/${vacante.id}/editar`} className="tb-btn tb-btn-secondary">
              Editar vacante
            </Link>
          </div>
        )}
      </div>

      {error && <div className="vac-bad" role="alert">{error}</div>}
      {loading ? (
        <div className="tb-loading"><div className="tb-spinner" /><p>Cargando postulaciones...</p></div>
      ) : !error && etapas.length === 0 ? (
        <div className="tb-loading"><p>No existen etapas de reclutamiento configuradas.</p></div>
      ) : (
        <TableroKanban
          etapas={etapas}
          postulaciones={postulaciones}
          empresaId={company?.id}
          onChanged={load}
        />
      )}
    </div>
  )
}
