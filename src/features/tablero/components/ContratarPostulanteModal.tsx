import { useState, type FormEvent } from 'react'
import { Alert, Button, Field, Modal } from '../../../shared/components'
import {
  CI_EXPEDIDOS,
  contratarPostulante,
  type PostulanteDetalle,
} from '../api/tableroApi'

type Props = {
  postulante: PostulanteDetalle
  empresaId?: string
  onClose: () => void
  onSuccess: () => Promise<void> | void
}

function partesNombre(nombre: string) {
  const partes = nombre.trim().split(/\s+/)
  return {
    paterno: partes.length > 1 ? partes[partes.length - 1] : '',
    materno: '',
  }
}

export function ContratarPostulanteModal({
  postulante,
  empresaId,
  onClose,
  onSuccess,
}: Props) {
  const partes = partesNombre(postulante.nombre_postulante)
  const hoy = new Date().toISOString().slice(0, 10)
  const [codigo, setCodigo] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState(partes.paterno)
  const [apellidoMaterno, setApellidoMaterno] = useState(partes.materno)
  const [ciExpedido, setCiExpedido] = useState('SC')
  const [fechaIngreso, setFechaIngreso] = useState(hoy)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validar() {
    const e: Record<string, string> = {}
    if (!codigo.trim()) e.codigo = 'El código es obligatorio'
    if (!apellidoPaterno.trim()) e.apellido_paterno = 'El apellido paterno es obligatorio'
    if (!fechaIngreso) e.fecha_ingreso = 'La fecha de ingreso es obligatoria'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    if (!validar()) return
    setSaving(true)
    try {
      await contratarPostulante(
        postulante.id,
        {
          codigo: codigo.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim(),
          ci_expedido: ciExpedido,
          fecha_ingreso: fechaIngreso,
        },
        empresaId,
      )
      await onSuccess()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo contratar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`Contratar a ${postulante.nombre_postulante}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="form-contratar" loading={saving}>
            Confirmar contratación
          </Button>
        </>
      }
    >
      <p className="text-muted">
        CI: {postulante.documento_identidad || '—'} · Correo: {postulante.email}
      </p>
      {error && <Alert tone="error">{error}</Alert>}

      <form id="form-contratar" className="form-stack" onSubmit={(e) => void enviar(e)}>
        <Field label="Código de empleado *">
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          {fieldErrors.codigo && <span className="text-danger">{fieldErrors.codigo}</span>}
        </Field>
        <Field label="Apellido paterno *">
          <input value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} />
          {fieldErrors.apellido_paterno && (
            <span className="text-danger">{fieldErrors.apellido_paterno}</span>
          )}
        </Field>
        <Field label="Apellido materno">
          <input value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} />
        </Field>
        <Field label="CI expedido">
          <select value={ciExpedido} onChange={(e) => setCiExpedido(e.target.value)}>
            {CI_EXPEDIDOS.map((dpto) => (
              <option key={dpto} value={dpto}>{dpto}</option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de ingreso *">
          <input
            type="date"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
          />
          {fieldErrors.fecha_ingreso && (
            <span className="text-danger">{fieldErrors.fecha_ingreso}</span>
          )}
        </Field>
      </form>
    </Modal>
  )
}