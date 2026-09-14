import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EntrevistaForm } from '../components/EntrevistaForm'
import {
  getEntrevista,
  getEntrevistadores,
  getEntrevistas,
  getPostulacionesOpcion,
  type Entrevista,
  type Entrevistador,
  type PostulacionOpcion,
} from '../api/entrevistasApi'
import '../entrevistas.css'

function formatFecha(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EntrevistasPage() {
  const [params] = useSearchParams()
  const postulacionId = Number(params.get('postulacion')) || undefined
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([])
  const [entrevistadores, setEntrevistadores] = useState<Entrevistador[]>([])
  const [postulaciones, setPostulaciones] = useState<PostulacionOpcion[]>([])
  const [editing, setEditing] = useState<Entrevista | null>(null)

  const load = useCallback(async () => {
    const [list, users, posts] = await Promise.all([
      getEntrevistas(),
      getEntrevistadores(),
      getPostulacionesOpcion(),
    ])
    setEntrevistas(list)
    setEntrevistadores(users)
    setPostulaciones(posts)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const nombrePostulante = (id: number) =>
    postulaciones.find((p) => p.id === id)?.nombre_postulante ?? `#${id}`
  const nombreEntrevistador = (id: number) =>
    entrevistadores.find((u) => u.id === id)?.nombre ?? `#${id}`

  return (
    <div className="en-page">
      <div className="en-eyebrow">Selección · Sprint 2</div>
      <h1>Agenda de entrevistas</h1>
      <p className="en-sub">Crear y editar entrevistas desde la postulación.</p>

      <div className="en-grid">
        <section className="en-card">
          <h2>Programadas</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="en-table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Modalidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entrevistas.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {nombrePostulante(e.postulacion_id)}
                      <div className="en-sub">{nombreEntrevistador(e.entrevistador_id)}</div>
                    </td>
                    <td><span className="en-chip">{e.tipo}</span></td>
                    <td>{formatFecha(e.fecha_hora)}</td>
                    <td>{e.modalidad}</td>
                    <td>
                      <button type="button" onClick={() => void getEntrevista(e.id).then(setEditing)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <EntrevistaForm
          entrevista={editing}
          postulacionId={postulacionId}
          entrevistadores={entrevistadores}
          postulaciones={postulaciones}
          onSaved={async () => {
            setEditing(null)
            await load()
          }}
        />
      </div>
    </div>
  )
}