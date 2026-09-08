import type { VacantePublica } from '../api/portalApi'

type Props = {
  vacantes: VacantePublica[]
  onSelect: (id: string) => void
}

export function VacantesPublicasList({ vacantes, onSelect }: Props) {
  return (
    <>
      <h1>Vacantes abiertas</h1>
      {vacantes.length === 0 && (
        <article className="po-card">
          <p className="po-sub">No hay vacantes publicadas por el momento.</p>
        </article>
      )}
      {vacantes.map((v) => (
        <article key={v.id} className="po-card">
          <div className="po-row">
            <div>
              <b>{v.titulo}</b>
              <div className="po-sub">{v.modalidad} · {v.ubicacion} · cierra {v.fecha_cierre}</div>
            </div>
            <button className="po-btn po-right" type="button" onClick={() => onSelect(v.id)}>
              Postularme
            </button>
          </div>
        </article>
      ))}
    </>
  )
}
