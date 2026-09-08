import type { VacantePublica } from '../api/portalApi'

type Props = {
  vacante: VacantePublica
  onBack: () => void
  onPostular: () => void
}

export function VacantePublicaDetalle({ vacante, onBack, onPostular }: Props) {
  return (
    <article className="po-card">
      <button className="po-link" type="button" onClick={onBack} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Volver al listado de vacantes
      </button>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>{vacante.titulo}</h1>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
        <span>🏢 {vacante.departamento_nombre || 'General'}</span>
        <span>💼 {vacante.cargo_nombre || 'Puesto'}</span>
        <span>📍 {vacante.modalidad} · {vacante.ubicacion || 'Bolivia'}</span>
        <span>⏳ Cierre: {vacante.fecha_cierre ? vacante.fecha_cierre.slice(0, 10) : 'Abierta'}</span>
      </div>

      {vacante.mostrar_salario && (vacante.salario_min != null || vacante.salario_max != null) && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', fontWeight: 600, marginBottom: '1rem' }}>
          💰 Rango Salarial: Bs. {vacante.salario_min ?? '0'} - {vacante.salario_max ?? '—'}
        </div>
      )}

      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Descripción del puesto</h3>
        <p style={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.6, margin: 0 }}>
          {vacante.descripcion}
        </p>
      </div>

      {vacante.requisitos && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Requisitos</h3>
          <p style={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {vacante.requisitos}
          </p>
        </div>
      )}

      {/* Habilidades Requeridas */}
      {vacante.habilidades && vacante.habilidades.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Habilidades requeridas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {vacante.habilidades.map((h) => (
              <div
                key={h.habilidad_id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{h.nombre}</span>
                <span style={{ fontSize: '0.75rem', color: '#475569', background: '#e2e8f0', borderRadius: '0.5rem', padding: '0.05rem 0.35rem' }}>
                  {h.nivel_requerido}
                </span>
                {h.es_obligatorio && (
                  <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700 }}>
                    (Obligatoria)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {vacante.beneficios && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Beneficios</h3>
          <p style={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {vacante.beneficios}
          </p>
        </div>
      )}

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
        <button
          className="po-btn"
          type="button"
          onClick={onPostular}
          style={{ width: '100%', maxWidth: 300, cursor: 'pointer', padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 700 }}
        >
          Postularme a esta vacante
        </button>
      </div>
    </article>
  )
}