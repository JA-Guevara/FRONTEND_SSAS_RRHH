import { useMemo } from 'react'
import type { FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { Alert, Button, Field, Modal } from '../../../shared/components'
import { evaluarPassword, generarPassword } from '../utils/passwordPolicy'

type User = components['schemas']['UsuarioResponse']

export type UsuarioModalClaveProps = {
  usuario: User
  nuevaClave: string
  onNuevaClaveChange: (valor: string) => void
  exigirCambio: boolean
  onExigirCambioChange: (valor: boolean) => void
  guardando: boolean
  errorFormulario: string | null
  erroresCampo: Record<string, string>
  onClose: () => void
  onSubmit: (evento: FormEvent) => void
}

export function UsuarioModalClave({
  usuario,
  nuevaClave,
  onNuevaClaveChange,
  exigirCambio,
  onExigirCambioChange,
  guardando,
  errorFormulario,
  erroresCampo,
  onClose,
  onSubmit,
}: UsuarioModalClaveProps) {
  const requisitosClave = useMemo(
    () => evaluarPassword(nuevaClave, usuario.username, usuario.email),
    [nuevaClave, usuario.username, usuario.email],
  )

  return (
    <Modal
      title={`Contraseña de ${usuario.nombre} ${usuario.apellido}`}
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <p className="text-muted">
          Al guardar se revocan todas las sesiones activas de este usuario.
        </p>
        <Field label="Nueva contraseña" error={erroresCampo.new_password}>
          <input
            type="text"
            value={nuevaClave}
            onChange={(evento) => onNuevaClaveChange(evento.target.value)}
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </Field>
        <div className="form-actions-start">
          <Button variant="secondary" size="sm" onClick={() => onNuevaClaveChange(generarPassword())}>
            Generar contraseña segura
          </Button>
        </div>
        <ul className="checklist">
          {requisitosClave.map((requisito) => (
            <li key={requisito.id} className={requisito.cumple ? 'cumple' : 'pendiente'}>
              {requisito.texto}
            </li>
          ))}
        </ul>
        <label className="check-label">
          <input
            type="checkbox"
            checked={exigirCambio}
            onChange={(evento) => onExigirCambioChange(evento.target.checked)}
          />
          Exigir cambio en el próximo inicio de sesión
        </label>
        {errorFormulario !== null && <Alert tone="error">{errorFormulario}</Alert>}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" loading={guardando}>
            Asignar contraseña
          </Button>
        </div>
      </form>
    </Modal>
  )
}
