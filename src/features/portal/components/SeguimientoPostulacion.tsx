import { useState, type FormEvent } from 'react'
import { consultarPostulacion } from '../api/portalApi'
import type { components } from '../../../shared/api/schema'

type Seguimiento = components['schemas']['SeguimientoPostulacionResponse']

export function SeguimientoPostulacion() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<Seguimiento | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConsultar(e: FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const data = await consultarPostulacion(codigo.trim().toUpperCase())
      setResultado(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se encontró la postulación con ese código.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
        Seguimiento de tu Postulación
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Ingresa el código alfanumérico que te fue asignado al postularte para conocer el estado actual de tu candidatura.
      </p>

      <form onSubmit={handleConsultar} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="po-input"
          placeholder="Ej. POS-ABC123XY"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          style={{ maxWidth: 300, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
          required
        />
        <button
          className="po-btn"
          type="submit"
          disabled={loading}
          style={{ padding: '0.65rem 1.25rem', cursor: 'pointer' }}
        >
          {loading ? 'Consultando...' : 'Consultar Estado'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', color: '#991b1b', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {resultado && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Código de seguimiento
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {resultado.codigo_seguimiento}
              </div>
            </div>
            <div
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '1rem',
                padding: '0.35rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              Etapa: {resultado.etapa}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Vacante</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{resultado.vacante}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Fecha de postulación</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {new Date(resultado.fecha_postulacion).toLocaleDateString('es-BO')}
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Última actualización</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {new Date(resultado.fecha_ultimo_cambio).toLocaleDateString('es-BO')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
