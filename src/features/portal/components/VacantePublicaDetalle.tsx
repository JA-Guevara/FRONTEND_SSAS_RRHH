import type { VacantePublica } from '../api/portalApi'

type Props = {
  vacante: VacantePublica
  onBack: () => void
  onPostular: () => void
}

export function VacantePublicaDetalle({ vacante, onBack, onPostular }: Props) {
  return (
    <article className="po-card">
      <button className="po-link" type="button" onClick={onBack}>← Volver al listado</button>
      <h1 style={{ fontSize: 28 }}>{vacante.titulo}</h1>
      <p className="po-sub">{vacante.modalidad} · {vacante.ubicacion} · cierra {vacante.fecha_cierre}</p>
      {vacante.mostrar_salario && (
        <p>Salario: {vacante.salario_min} – {vacante.salario_max}</p>
      )}
      <p><b>Descripción</b><br />{vacante.descripcion}</p>
      <p><b>Requisitos</b><br />{vacante.requisitos}</p>
      <p><b>Beneficios</b><br />{vacante.beneficios || '—'}</p>
      <button className="po-btn" type="button" onClick={onPostular}>Postularme</button>
    </article>
  )
}