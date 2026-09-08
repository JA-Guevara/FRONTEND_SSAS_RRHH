import { useState, type FormEvent } from 'react'
import { NIVELES_EDUCATIVOS, enviarPostulacion, type NivelEducativo, type VacantePublica } from '../api/portalApi'

type Props = {
  vacante: VacantePublica
  onBack: () => void
}

const empty = {
  nombres: '',
  apellidos: '',
  ci: '',
  email: '',
  telefono: '',
  ciudad: '',
  nivel_educativo: '' as NivelEducativo | '',
  anios_experiencia: '',
  linkedin: '',
  cv: null as File | null,
}

export function PostulacionForm({ vacante, onBack }: Props) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [codigo, setCodigo] = useState('')
  const [bad, setBad] = useState('')
  const [saving, setSaving] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.nombres.trim()) e.nombres = 'Obligatorio'
    if (!form.apellidos.trim()) e.apellidos = 'Obligatorio'
    if (!form.email.trim()) e.email = 'Obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.cv) e.cv = 'El CV es obligatorio'
    else if (form.cv.size > 5 * 1024 * 1024) e.cv = 'Máximo 5 MB'
    else if (!/\.(pdf|docx?)$/i.test(form.cv.name)) e.cv = 'Solo PDF o DOCX'
    if (form.anios_experiencia && (Number.isNaN(Number(form.anios_experiencia)) || Number(form.anios_experiencia) < 0)) {
      e.anios_experiencia = 'Debe ser 0 o más'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBad('')
    setCodigo('')
    if (!validate()) return
    setSaving(true)
    try {
      const res = await enviarPostulacion(vacante.id, form)
      setCodigo(res.codigo_seguimiento)
      setForm(empty)
    } catch (err) {
      const withFields = err as Error & { fields?: Record<string, string> }
      if (withFields.fields) setErrors(withFields.fields)
      setBad(withFields.message || 'No se pudo enviar')
    } finally {
      setSaving(false)
    }
  }

  if (codigo) {
    return (
      <div className="po-card">
        <div className="po-ok">
          Postulación enviada. Tu código de seguimiento es <b>{codigo}</b>
        </div>
        <p className="po-sub">Guárdalo para consultar el estado después.</p>
        <button className="po-btn sec" type="button" onClick={onBack}>Volver a vacantes</button>
      </div>
    )
  }

  return (
    <form className="po-card" onSubmit={handleSubmit}>
      <button className="po-link" type="button" onClick={onBack}>← Volver</button>
      <h2>Postularme a {vacante.titulo}</h2>
      <div className="po-grid">
        <div>
          <label className="po-label">Nombres <i>*</i></label>
          <input className={`po-input ${errors.nombres ? 'error' : ''}`} value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
          {errors.nombres && <div className="po-error">{errors.nombres}</div>}
        </div>
        <div>
          <label className="po-label">Apellidos <i>*</i></label>
          <input className={`po-input ${errors.apellidos ? 'error' : ''}`} value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
          {errors.apellidos && <div className="po-error">{errors.apellidos}</div>}
        </div>
        <div>
          <label className="po-label">CI</label>
          <input className="po-input" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} />
        </div>
        <div>
          <label className="po-label">Email <i>*</i></label>
          <input className={`po-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <div className="po-error">{errors.email}</div>}
        </div>
        <div>
          <label className="po-label">Teléfono</label>
          <input className="po-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>
        <div>
          <label className="po-label">Ciudad</label>
          <input className="po-input" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
        </div>
        <div>
          <label className="po-label">Nivel educativo</label>
          <select className="po-select" value={form.nivel_educativo} onChange={(e) => setForm({ ...form, nivel_educativo: e.target.value as NivelEducativo | '' })}>
            <option value="">Seleccionar</option>
            {NIVELES_EDUCATIVOS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="po-label">Años de experiencia</label>
          <input className={`po-input ${errors.anios_experiencia ? 'error' : ''}`} value={form.anios_experiencia} onChange={(e) => setForm({ ...form, anios_experiencia: e.target.value })} />
          {errors.anios_experiencia && <div className="po-error">{errors.anios_experiencia}</div>}
        </div>
      </div>
      <label className="po-label">LinkedIn</label>
      <input className="po-input" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />

      <label className="po-label">CV <i>*</i> <small>PDF/DOCX · máx 5 MB</small></label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setForm({ ...form, cv: e.target.files?.[0] ?? null })}
      />
      {errors.cv && <div className="po-error">{errors.cv}</div>}

      {bad && <div className="po-bad">{bad}</div>}
      <div style={{ marginTop: 14 }}>
        <button className="po-btn" type="submit" disabled={saving}>
          {saving ? 'Enviando...' : 'Enviar postulación'}
        </button>
      </div>
    </form>
  )
}
