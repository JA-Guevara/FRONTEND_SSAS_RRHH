import type { FormEvent } from 'react'
import type { components } from '../../../shared/api/schema'
import { Alert, Button, Modal } from '../../../shared/components'
import { CamposUsuarioForm, type UsuarioFormValores } from './CamposUsuarioForm'

type User = components['schemas']['UsuarioResponse']
type Role = components['schemas']['RoleSchema']

export type UsuarioModalEditarProps = {
  usuario: User
  roles: Role[]
  rolesError: string | null
  valores: UsuarioFormValores
  cambiar: (siguiente: UsuarioFormValores) => void
  guardando: boolean
  errorFormulario: string | null
  erroresCampo: Record<string, string>
  esVistaGlobal: boolean
  onClose: () => void
  onSubmit: (evento: FormEvent) => void
}

export function UsuarioModalEditar({
  usuario,
  roles,
  rolesError,
  valores,
  cambiar,
  guardando,
  errorFormulario,
  erroresCampo,
  esVistaGlobal,
  onClose,
  onSubmit,
}: UsuarioModalEditarProps) {
  return (
    <Modal
      title={`Editar ${usuario.nombre} ${usuario.apellido}`}
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
        {errorFormulario !== null && <Alert tone="error">{errorFormulario}</Alert>}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" loading={guardando}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  )
}
