import type { components } from '../../../shared/api/schema'
import { Alert, Field } from '../../../shared/components'

type Role = components['schemas']['RoleSchema']

export type UsuarioFormValores = {
  nombre: string
  apellido: string
  email: string
  username: string
  telefono?: string
  role_ids: string[]
  password?: string
  exigir_verificacion?: boolean
}

export type CamposUsuarioFormProps<T extends UsuarioFormValores> = {
  valores: T
  cambiar: (siguiente: T) => void
  roles: Role[]
  rolesError: string | null
  erroresCampo: Record<string, string>
  esVistaGlobal: boolean
}

function alternarRol(anteriores: string[], id: string): string[] {
  return anteriores.includes(id)
    ? anteriores.filter((item) => item !== id)
    : [...anteriores, id]
}

export function CamposUsuarioForm<T extends UsuarioFormValores>({
  valores,
  cambiar,
  roles,
  rolesError,
  erroresCampo,
  esVistaGlobal,
}: CamposUsuarioFormProps<T>) {
  const sinRolesEnAmbito = roles.length === 0 && rolesError === null

  return (
    <>
      <div className="form-grid">
        <Field label="Nombres" error={erroresCampo.nombre}>
          <input
            value={valores.nombre}
            onChange={(evento) => cambiar({ ...valores, nombre: evento.target.value })}
            minLength={2}
            maxLength={120}
            required
          />
        </Field>
        <Field label="Apellidos" error={erroresCampo.apellido}>
          <input
            value={valores.apellido}
            onChange={(evento) => cambiar({ ...valores, apellido: evento.target.value })}
            maxLength={120}
            required
          />
        </Field>
      </div>

      <div className="form-grid">
        <Field label="Correo electrónico" error={erroresCampo.email}>
          <input
            type="email"
            value={valores.email}
            onChange={(evento) => cambiar({ ...valores, email: evento.target.value })}
            required
          />
        </Field>
        <Field
          label="Nombre de usuario"
          hint="Mínimo 3 caracteres. Solo minúsculas, números, punto, guion y guion bajo."
          error={erroresCampo.username}
        >
          <input
            value={valores.username}
            onChange={(evento) =>
              cambiar({
                ...valores,
                username: evento.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''),
              })
            }
            minLength={3}
            maxLength={80}
            required
          />
        </Field>
      </div>

      <Field label="Teléfono" error={erroresCampo.telefono}>
        <input
          value={valores.telefono ?? ''}
          onChange={(evento) => cambiar({ ...valores, telefono: evento.target.value })}
          maxLength={40}
        />
      </Field>

      <Field
        label="Roles"
        group
        hint={
          esVistaGlobal
            ? 'Roles globales de la plataforma. Obligatorio: sin rol el usuario no puede iniciar sesión.'
            : 'Roles de esta empresa. Obligatorio: sin rol el usuario no puede iniciar sesión.'
        }
        error={erroresCampo.role_ids}
      >
        {rolesError !== null ? (
          <Alert tone="error">{rolesError}</Alert>
        ) : sinRolesEnAmbito ? (
          <Alert tone="info">
            {esVistaGlobal
              ? 'No hay roles globales disponibles. Consulta la configuración de roles de la plataforma.'
              : 'No hay roles disponibles en esta empresa. Crea primero un rol en «Roles y permisos».'}
          </Alert>
        ) : (
          <div className="check-grid">
            {roles.map((rol) => (
              <label key={rol.id} className="check-label">
                <input
                  type="checkbox"
                  checked={valores.role_ids.includes(rol.id)}
                  onChange={() =>
                    cambiar({ ...valores, role_ids: alternarRol(valores.role_ids, rol.id) })
                  }
                />
                {rol.name}
              </label>
            ))}
          </div>
        )}
      </Field>
    </>
  )
}
