import { useState, type FormEvent } from 'react'

type Parametro = {
  codigo: string
  nombre: string
  valor: string
}

const PARAMETROS_INICIALES: Parametro[] = [
  { codigo: 'SMN', nombre: 'Salario mínimo nacional', valor: '2500.00' },
  { codigo: 'APORTE_AFP_JUB', nombre: 'Aporte laboral jubilación (%)', valor: '10.00' },
  { codigo: 'APORTE_RIESGO', nombre: 'Aporte riesgo común (%)', valor: '1.71' },
  { codigo: 'PATRONAL_CNS', nombre: 'Aporte patronal salud (%)', valor: '10.00' },
  { codigo: 'DIAS_MES', nombre: 'Días base del mes', valor: '30' },
]

export function ParametrosLeyForm() {
  const [params, setParams] = useState<Parametro[]>(PARAMETROS_INICIALES)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  function handleChange(codigo: string, valor: string) {
    setParams((prev) => prev.map((p) => (p.codigo === codigo ? { ...p, valor } : p)))
    setErrors((prev) => ({ ...prev, [codigo]: '' }))
    setSuccess(null)
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    for (const p of params) {
      if (!p.valor.trim()) {
        next[p.codigo] = 'Obligatorio'
      } else if (Number.isNaN(Number(p.valor))) {
        next[p.codigo] = 'Debe ser numérico'
      } else if (Number(p.valor) < 0) {
        next[p.codigo] = 'No puede ser negativo'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSuccess(null)
    if (!validate()) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 700)) // mock
    setLoading(false)
    setSuccess('Parámetros de ley guardados correctamente')
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640, display: 'grid', gap: 14 }}>
      {params.map((p) => (
        <div key={p.codigo}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>
            {p.nombre} <span style={{ color: '#6b7280' }}>({p.codigo})</span>
          </label>
          <input
            value={p.valor}
            onChange={(e) => handleChange(p.codigo, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: errors[p.codigo] ? '1px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: 6,
            }}
          />
          {errors[p.codigo] && (
            <p style={{ color: '#dc2626', fontSize: 13, margin: '4px 0 0' }}>{errors[p.codigo]}</p>
          )}
        </div>
      ))}

      {success && (
        <p style={{ color: '#166534', background: '#dcfce7', padding: 10, borderRadius: 6 }}>
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 16px',
          background: loading ? '#93c5fd' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        {loading ? 'Guardando...' : 'Guardar parámetros'}
      </button>
    </form>
  )
}