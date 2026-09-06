import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TableroKanban } from '../components/TableroKanban'
import {
  getEtapas,
  getPostulaciones,
  type Etapa,
  type PostulanteDetalle,
} from '../api/tableroApi'
import { getVacante, type Vacante } from '../../vacantes/api/vacantesApi'
import '../tablero.css'

export function TableroPage() {
  const { id } = useParams()
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [postulaciones, setPostulaciones] = useState<PostulanteDetalle[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ets, posts] = await Promise.all([
        getEtapas(),
        getPostulaciones(id ? Number(id) : undefined),
      ])
      setEtapas(ets)
      setPostulaciones(posts)

      if (id) {
        try {
          const v = await getVacante(Number(id))
          setVacante(v)
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="tb-page">
      <div className="tb-top-nav">
        <Link to="/vacantes" className="tb-back-link">
          ‹ Volver a Vacantes
        </Link>
      </div>

      <div className="tb-header-row">
        <div>
          <div className="tb-eyebrow">Reclutamiento & Selección · Sprint 1</div>
          <h1>{vacante ? `Tablero: ${vacante.titulo}` : 'Tablero Kanban de Postulaciones'}</h1>
          <p className="tb-sub">
            {vacante
              ? `Vacantes: ${vacante.cantidad_vacantes} · Modalidad: ${vacante.modalidad} · Total postulantes: ${postulaciones.length}`
              : 'Gestión ágil de candidatos según las etapas de reclutamiento. Haz clic en un postulante para ver su CV, notas o rechazar.'}
          </p>
        </div>

        {vacante && (
          <div className="tb-vacante-actions">
            <Link to={`/vacantes/${vacante.id}/editar`} className="tb-btn tb-btn-secondary">
              ✏️ Editar vacante
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="tb-loading">
          <div className="tb-spinner" />
          <p>Cargando postulaciones...</p>
        </div>
      ) : (
        <TableroKanban etapas={etapas} postulaciones={postulaciones} onChanged={load} />
      )}
    </div>
  )
}