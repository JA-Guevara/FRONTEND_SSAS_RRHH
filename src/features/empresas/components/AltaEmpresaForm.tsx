import { useState, type FormEvent } from 'react'
import { crearEmpresa, type EmpresaFormData } from '../api/empresasApi'

const initialForm: EmpresaFormData = {
  razon_social: '',
  nombre_comercial: '',
  nit: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  email: '',
}

type FieldErrors = Partial<Record<keyof EmpresaFormData, string>>

function validate(data: EmpresaFormData): FieldErrors {
  const errors: FieldErrors = {}

  if (!data.razon_social.trim()) errors.razon_social = 'La razón social es obligatoria'
  if (!data.nombre_comercial.trim()) errors.nombre_comercial = 'El nombre comercial es obligatorio'
  if (!data.nit.trim()) errors.nit = 'El NIT es obligatorio'
  else if (!/^\d{5,20}$/.test(data.nit.trim())) errors.nit = 'El NIT debe tener entre 5 y 20 dígitos'

  if (!data.direccion.trim()) errors.direccion = 'La dirección es obligatoria'
  if (!data.ciudad.trim()) errors.ciudad = 'La ciudad es obligatoria'

  if (!data.telefono.trim()) errors.telefono = 'El teléfono es obligatorio'
  else if (!/^\d{7,15}$/.test(data.telefono.trim())) errors.telefono = 'Teléfono inválido'

  if (!data.email.trim()) errors.email = 'El email es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Email inválido'

  return errors
}

export function AltaEmpresaForm() {
  const [form, setForm] = useState<EmpresaFormData>(initialForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleChange(field: keyof EmpresaFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSuccess(null)
    setErrorMsg(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSuccess(null)
    setErrorMsg(null)

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const result = await crearEmpresa(form)
      setSuccess(result.message)
      setForm(initialForm)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo guardar la empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, display: 'grid', gap: 12 }}>
      {(Object.keys(initialForm) as (keyof EmpresaFormData)[]).map((field) => (
        <div key={field}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            {field.replaceAll('_', ' ')}
          </label>
          <input
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: errors[field] ? '1px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: 6,
            }}
          />
          {errors[field] && (
            <p style={{ color: '#dc2626', fontSize: 13, margin: '4px 0 0' }}>{errors[field]}</p>
          )}
        </div>
      ))}

      {errorMsg && (
        <p style={{ color: '#dc2626', background: '#fef2f2', padding: 10, borderRadius: 6 }}>
          {errorMsg}
        </p>
      )}

      {success && (
        <p style={{ color: '#166534', background: '#dcfce7', padding: 10, borderRadius: 6 }}>
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: 8,
          padding: '10px 16px',
          background: loading ? '#93c5fd' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        {loading ? 'Guardando...' : 'Registrar empresa'}
      </button>
    </form>
  )
}