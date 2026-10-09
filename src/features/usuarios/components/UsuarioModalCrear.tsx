import { useMemo } from 'react'
import type { FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { Alert, Button, Field, Modal } from '../../../shared/components'
import { evaluarPassword, generarPassword } from '../utils/passwordPolicy'
import { CamposUsuarioForm, type UsuarioFormValores } from './CamposUsuarioForm'

type Role = components['schemas']['RoleSchema']

export type UsuarioModalCrearProps = {
  esVistaGlobal: boolean
  roles: Role[]
  rolesError: string | null
  valores: UsuarioFormValores
  cambiar: (siguiente: UsuarioFormValores) => void
  guardando: boolean
  errorFormulario: string | null
  erroresCampo: Record<string, string>
  onClose: () => void
  onSubmit: (evento: FormEvent) => void
}

export function UsuarioModalCrear({
  esVistaGlobal,
  roles,
  rolesError,
  valores,
  cambiar,
  guardando,
  errorFormulario,
  erroresCampo,
  onClose,
  onSubmit,
}: UsuarioModalCrearProps) {
  const sinRolesEnAmbito = roles.length === 0 && rolesError === null

  const requisitos = useMemo(
    () => evaluarPassword(valores.password ?? '', valores.username, valores.email),
    [valores.password, valores.username, valores.email],
  )

  return (
    <Modal
      title={esVistaGlobal ? 'Nuevo administrador global' : 'Nuevo usuario'}
      size="lg"
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <CamposUsuarioForm
          valores={valores}
          cambiar={cambiar}
          roles={roles}
          rolesError={rolesError}
          erroresCampo={erroresCampo}
          esVistaGlobal={esVistaGlobal}
        />

        <Field
          label="Contraseña provisional"
          hint="El usuario deberá cambiarla en su primer inicio de sesión."
          error={erroresCampo.password}
        >
          <input
            type="text"
            value={valores.password ?? ''}
            onChange={(evento) => cambiar({ ...valores, password: evento.target.value })}
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </Field>

        <div className="form-actions-start">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => cambiar({ ...valores, password: generarPassword() })}
          >
            Generar contraseña segura
          </Button>
        </div>

        <ul className="checklist">
          {requisitos.map((requisito) => (
            <li key={requisito.id} className={requisito.cumple ? 'cumple' : 'pendiente'}>
              {requisito.texto}
            </li>
          ))}
        </ul>

        <label className="check-label">
          <input
            type="checkbox"
            checked={valores.exigir_verificacion ?? false}
            onChange={(evento) =>
              cambiar({ ...valores, exigir_verificacion: evento.target.checked })
            }
          />
          Exigir que verifique su correo antes de poder entrar
        </label>

        {valores.exigir_verificacion && (
          <Alert tone="info">
            La cuenta no podrá iniciar sesión hasta que el titular abra el enlace de
            verificación que se le envía por correo. Si el envío de correo no está
            configurado, la cuenta quedará inutilizable.
          </Alert>
        )}

        {errorFormulario !== null && <Alert tone="error">{errorFormulario}</Alert>}

        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" loading={guardando} disabled={sinRolesEnAmbito}>
            {esVistaGlobal ? 'Crear administrador' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
