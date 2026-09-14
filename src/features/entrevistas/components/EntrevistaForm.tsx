import { useEffect, useState, type FormEvent } from 'react'
import {
  MODALIDADES_ENTREVISTA,
  TIPOS_ENTREVISTA,
  actualizarEntrevista,
  crearEntrevista,
  type Entrevista,
  type EntrevistaFormData,
  type Entrevistador,
  type ModalidadEntrevista,
  type PostulacionOpcion,
  type TipoEntrevista,
} from '../api/entrevistasApi'

type Props = {
  entrevista?: Entrevista | null
  postulacionId?: number
  entrevistadores: Entrevistador[]
  postulaciones: PostulacionOpcion[]
  onSaved: () => Promise<void>
}

const empty = {
  postulacion_id: '',
  entrevistador_id: '',
  tipo: 'TECNICA' as TipoEntrevista,
  fecha_hora: '',
  duracion_min: '45',
  modalidad: 'VIRTUAL' as ModalidadEntrevista,
  enlace_reunion: '',
  lugar: '',
}

export function EntrevistaForm({
  entrevista,
  postulacionId,
  entrevistadores,
  postulaciones,
  onSaved,
}: Props) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ok, setOk] = useState('')
  const [bad, setBad] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (entrevista) {
      setForm({
        postulacion_id: String(entrevista.postulacion_id),
        entrevistador_id: String(entrevista.entrevistador_id),
        tipo: entrevista.tipo,
        fecha_hora: entrevista.fecha_hora,
        duracion_min: entrevista.duracion_min == null ? '' : String(entrevista.duracion_min),
        modalidad: entrevista.modalidad,
        enlace_reunion: entrevista.enlace_reunion,
        lugar: entrevista.lugar,
      })
    } else {
      setForm({
        ...empty,
        postulacion_id: postulacionId ? String(postulacionId) : '',
      })
    }
  }, [entrevista, postulacionId])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.postulacion_id) e.postulacion_id = 'Selecciona la postulación'
    if (!form.entrevistador_id) e.entrevistador_id = 'Selecciona el entrevistador'
    if (!form.fecha_hora) e.fecha_hora = 'La fecha y hora son obligatorias'
    else if (new Date(form.fecha_hora) <= new Date()) e.fecha_hora = 'Debe ser fecha/hora futura'
    if (form.duracion_min && (Number.isNaN(Number(form.duracion_min)) || Number(form.duracion_min) < 1)) {
      e.duracion_min = 'Debe ser 1 o más'
    }
    if (form.modalidad === 'VIRTUAL' && !form.enlace_reunion.trim()) {
      e.enlace_reunion = 'El enlace es obligatorio en modalidad virtual'
    }
    if (form.modalidad === 'PRESENCIAL' && !form.lugar.trim()) {
      e.lugar = 'El lugar es obligatorio en modalidad presencial'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setOk('')
    setBad('')
    if (!validate()) return
    setSaving(true)
    try {
      const payload: EntrevistaFormData = {
        postulacion_id: Number(form.postulacion_id),
        entrevistador_id: Number(form.entrevistador_id),
        tipo: form.tipo,
        fecha_hora: form.fecha_hora,
        duracion_min: form.duracion_min === '' ? null : Number(form.duracion_min),
        modalidad: form.modalidad,
        enlace_reunion: form.modalidad === 'VIRTUAL' ? form.enlace_reunion.trim() : '',
        lugar: form.modalidad === 'PRESENCIAL' ? form.lugar.trim() : '',
      }
      if (entrevista) await actualizarEntrevista(entrevista.id, payload)
      else await crearEntrevista(payload)
      setOk(entrevista ? 'Entrevista actualizada' : 'Entrevista programada')
      await onSaved()
    } catch (err) {
      setBad(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="en-card" onSubmit={handleSubmit}>
      <h2>{entrevista ? 'Editar entrevista' : 'Programar entrevista'}</h2>
      <div className="en-form-grid">
        <div>
          <label className="en-label">Postulación <i>*</i></label>
          <select
            className={`en-select ${errors.postulacion_id ? 'error' : ''}`}
            value={form.postulacion_id}
            onChange={(e) => setForm({ ...form, postulacion_id: e.target.value })}
          >
            <option value="">Seleccionar</option>
            {postulaciones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_postulante} — {p.vacante}
              </option>
            ))}
          </select>
          {errors.postulacion_id && <div className="en-error">{errors.postulacion_id}</div>}
        </div>
        <div>
          <label className="en-label">Entrevistador <i>*</i></label>
          <select
            className={`en-select ${errors.entrevistador_id ? 'error' : ''}`}
            value={form.entrevistador_id}
            onChange={(e) => setForm({ ...form, entrevistador_id: e.target.value })}
          >
            <option value="">Seleccionar</option>
            {entrevistadores.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.rol})
              </option>
            ))}
          </select>
          {errors.entrevistador_id && <div className="en-error">{errors.entrevistador_id}</div>}
        </div>
        <div>
          <label className="en-label">Tipo <i>*</i></label>
          <select
            className="en-select"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoEntrevista })}
          >
            {TIPOS_ENTREVISTA.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="en-label">Fecha y hora <i>*</i></label>
          <input
            type="datetime-local"
            className={`en-input ${errors.fecha_hora ? 'error' : ''}`}
            value={form.fecha_hora}
            onChange={(e) => setForm({ ...form, fecha_hora: e.target.value })}
          />
          {errors.fecha_hora && <div className="en-error">{errors.fecha_hora}</div>}
        </div>
        <div>
          <label className="en-label">Duración (min)</label>
          <input
            className={`en-input ${errors.duracion_min ? 'error' : ''}`}
            value={form.duracion_min}
            onChange={(e) => setForm({ ...form, duracion_min: e.target.value })}
          />
          {errors.duracion_min && <div className="en-error">{errors.duracion_min}</div>}
        </div>
        <div>
          <label className="en-label">Modalidad <i>*</i></label>
          <select
            className="en-select"
            value={form.modalidad}
            onChange={(e) => setForm({ ...form, modalidad: e.target.value as ModalidadEntrevista })}
          >
            {MODALIDADES_ENTREVISTA.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {form.modalidad === 'VIRTUAL' && (
        <>
          <label className="en-label">Enlace de reunión <i>*</i></label>
          <input
            className={`en-input ${errors.enlace_reunion ? 'error' : ''}`}
            value={form.enlace_reunion}
            onChange={(e) => setForm({ ...form, enlace_reunion: e.target.value })}
          />
          {errors.enlace_reunion && <div className="en-error">{errors.enlace_reunion}</div>}
        </>
      )}

      {form.modalidad === 'PRESENCIAL' && (
        <>
          <label className="en-label">Lugar <i>*</i></label>
          <input
            className={`en-input ${errors.lugar ? 'error' : ''}`}
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
          />
          {errors.lugar && <div className="en-error">{errors.lugar}</div>}
        </>
      )}

      {bad && <div className="en-bad">{bad}</div>}
      {ok && <div className="en-ok">{ok}</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="en-btn" type="submit" disabled={saving}>
          {saving ? 'Guardando...' : entrevista ? 'Guardar cambios' : 'Programar entrevista'}
        </button>
      </div>
    </form>
  )
}