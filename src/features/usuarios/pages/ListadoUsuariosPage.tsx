import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Can, useAccess } from '../../../app/access/AccessProvider'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { ApiError } from '../../../shared/api/httpClient'
import type { components } from '../../../shared/api/schema'
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Pagination,
  Panel,
} from '../../../shared/components'
import type { Column } from '../../../shared/components'
import { rolesAsignablesApi } from '../api/rolesAsignablesApi'
import { usuariosApi } from '../api/usuariosApi'
import { passwordEsValida } from '../utils/passwordPolicy'
import { UsuarioFiltros } from '../components/UsuarioFiltros'
import { UsuarioModalCrear } from '../components/UsuarioModalCrear'
import { UsuarioModalEditar } from '../components/UsuarioModalEditar'
import { UsuarioModalClave } from '../components/UsuarioModalClave'
import type { UsuarioFormValores } from '../components/CamposUsuarioForm'

type User = components['schemas']['UsuarioResponse']
type Role = components['schemas']['RoleSchema']

type UserScope = 'company' | 'platform'

type AccionPendiente = {
  usuario: User
  tipo: 'desactivar' | 'activar' | 'eliminar' | 'restaurar' | 'desbloquear'
}

const TITULO_ACCION: Record<AccionPendiente['tipo'], string> = {
  desactivar: 'Desactivar usuario',
  activar: 'Activar usuario',
  eliminar: 'Eliminar usuario',
  restaurar: 'Restaurar usuario',
  desbloquear: 'Desbloquear usuario',
}

const DETALLE_ACCION: Record<AccionPendiente['tipo'], string> = {
  desactivar: 'No podrá iniciar sesión hasta que lo actives de nuevo.',
  activar: 'Podrá volver a iniciar sesión con sus credenciales actuales.',
  eliminar: 'Se revocan sus sesiones y deja de aparecer en el listado. Podrás restaurarlo después.',
  restaurar: 'Vuelve al listado, pero queda inactivo: tendrás que activarlo.',
  desbloquear: 'Se borran los intentos fallidos y el bloqueo temporal por seguridad.',
}

const FORM_VACIO: UsuarioFormValores = {
  nombre: '',
  apellido: '',
  email: '',
  username: '',
  password: '',
  telefono: '',
  role_ids: [],
  exigir_verificacion: false,
}

const PERM_VER = ['usuarios:ver', 'platform:usuarios:gestionar']
const PERM_CREAR = ['usuarios:crear', 'platform:usuarios:gestionar']
const PERM_EDITAR = ['usuarios:editar', 'platform:usuarios:gestionar']
const PERM_ELIMINAR = ['usuarios:eliminar', 'platform:usuarios:gestionar']
const PERM_RESTAURAR = ['usuarios:restaurar', 'platform:usuarios:gestionar']
const PERM_PASSWORD = ['usuarios:cambiar_password', 'platform:usuarios:gestionar']
const PERM_DESBLOQUEAR = ['usuarios:desbloquear', 'platform:usuarios:gestionar']

export function ListadoUsuariosPage({ scope }: { scope: UserScope }) {
  const { company } = useCompanyScope()
  const { can } = useAccess()
  const esVistaGlobal = scope === 'platform'

  const [usuarios, setUsuarios] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [search, setSearch] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [incluirEliminados, setIncluirEliminados] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const [roles, setRoles] = useState<Role[]>([])
  const [rolesError, setRolesError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [editando, setEditando] = useState<User | null>(null)
  const [cambiandoClave, setCambiandoClave] = useState<User | null>(null)
  const [accion, setAccion] = useState<AccionPendiente | null>(null)

  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null)
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})

  const [createForm, setCreateForm] = useState<UsuarioFormValores>(FORM_VACIO)
  const [editForm, setEditForm] = useState<UsuarioFormValores>(FORM_VACIO)
  const [nuevaClave, setNuevaClave] = useState('')
  const [exigirCambio, setExigirCambio] = useState(true)

  const empresaConsulta = esVistaGlobal ? undefined : (company?.id ?? undefined)
  const empresaAlta = esVistaGlobal ? undefined : (company?.id ?? undefined)

  const cargar = useCallback(async () => {
    if (!esVistaGlobal && company?.id === undefined) {
      setUsuarios([])
      setTotal(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const respuesta = await usuariosApi.list({
        page,
        per_page: perPage,
        empresa_id: empresaConsulta,
        search: busqueda.trim() !== '' ? busqueda.trim() : undefined,
        is_active: estadoFiltro === '' ? undefined : estadoFiltro === 'true',
        incluir_eliminados: incluirEliminados ? true : undefined,
      })
      setUsuarios(respuesta.items)
      setTotal(respuesta.total)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la lista de usuarios.')
    } finally {
      setLoading(false)
    }
  }, [busqueda, company?.id, empresaConsulta, esVistaGlobal, estadoFiltro, incluirEliminados, page, perPage])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useEffect(() => {
    let cancelado = false
    setRolesError(null)

    rolesAsignablesApi
      .list(empresaConsulta)
      .then((data) => {
        if (!cancelado) setRoles(data)
      })
      .catch((cause) => {
        if (!cancelado) {
          setRoles([])
          setRolesError(
            cause instanceof Error ? cause.message : 'No se pudieron cargar los roles asignables.',
          )
        }
      })

    return () => {
      cancelado = true
    }
  }, [empresaConsulta])

  function limpiarErrores() {
    setErrorFormulario(null)
    setErroresCampo({})
  }

  function registrarError(cause: unknown, porOmision: string) {
    if (cause instanceof ApiError) {
      if (Object.keys(cause.fieldErrors).length > 0) {
        setErroresCampo(cause.fieldErrors)
        setErrorFormulario('Revisa los campos marcados.')
        return
      }
      setErrorFormulario(cause.message || porOmision)
      return
    }
    setErrorFormulario(cause instanceof Error ? cause.message : porOmision)
  }

  async function crear(evento: FormEvent) {
    evento.preventDefault()
    limpiarErrores()

    if (createForm.role_ids.length === 0) {
      setErroresCampo({ role_ids: 'Selecciona al menos un rol para el usuario.' })
      return
    }

    if (!passwordEsValida(createForm.password ?? '', createForm.username, createForm.email)) {
      setErroresCampo({ password: 'La contraseña no cumple todos los requisitos.' })
      setErrorFormulario('Revisa los requisitos de la contraseña antes de continuar.')
      return
    }

    setGuardando(true)
    try {
      await usuariosApi.create({
        nombre: createForm.nombre.trim(),
        apellido: createForm.apellido.trim(),
        email: createForm.email.trim(),
        username: createForm.username.trim(),
        password: createForm.password ?? '',
        telefono: createForm.telefono?.trim() || null,
        role_ids: createForm.role_ids,
        email_verificado: !createForm.exigir_verificacion,
        ...(empresaAlta !== undefined ? { empresa_id: empresaAlta } : {}),
      })
      setShowCreate(false)
      setCreateForm(FORM_VACIO)
      setMensaje(
        esVistaGlobal
          ? 'Administrador de plataforma creado correctamente.'
          : 'Usuario creado correctamente.',
      )
      await cargar()
    } catch (cause) {
      registrarError(cause, 'No se pudo crear el usuario.')
    } finally {
      setGuardando(false)
    }
  }

  function empezarEdicion(usuario: User) {
    limpiarErrores()
    const idsRoles = roles
      .filter((rol) => usuario.roles?.includes(rol.name) || usuario.roles?.includes(rol.codigo))
      .map((rol) => rol.id)
    setEditando(usuario)
    setEditForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      username: usuario.username,
      telefono: usuario.telefono ?? '',
      password: '',
      role_ids: idsRoles,
      exigir_verificacion: false,
    })
  }

  async function actualizar(evento: FormEvent) {
    evento.preventDefault()
    if (editando === null) return
    limpiarErrores()
    if (editForm.role_ids.length === 0) {
      setErroresCampo({ role_ids: 'Selecciona al menos un rol.' })
      return
    }
    setGuardando(true)
    try {
      await usuariosApi.update(
        editando.id,
        {
          nombre: editForm.nombre.trim(),
          apellido: editForm.apellido.trim(),
          email: editForm.email.trim(),
          username: editForm.username.trim(),
          telefono: editForm.telefono?.trim() || null,
          role_ids: editForm.role_ids,
        },
        editando.empresa_id ?? undefined,
      )
      setEditando(null)
      setMensaje('Usuario actualizado correctamente.')
      await cargar()
    } catch (cause) {
      registrarError(cause, 'No se pudo actualizar el usuario.')
    } finally {
      setGuardando(false)
    }
  }

  async function asignarClave(evento: FormEvent) {
    evento.preventDefault()
    if (cambiandoClave === null) return
    limpiarErrores()
    if (!passwordEsValida(nuevaClave, cambiandoClave.username, cambiandoClave.email)) {
      setErroresCampo({ new_password: 'La contraseña no cumple todos los requisitos.' })
      return
    }
    setGuardando(true)
    try {
      await usuariosApi.changePassword(
        cambiandoClave.id,
        { new_password: nuevaClave, must_change: exigirCambio },
        cambiandoClave.empresa_id ?? undefined,
      )
      setCambiandoClave(null)
      setNuevaClave('')
      setMensaje('Contraseña asignada. Se revocaron las sesiones activas del usuario.')
    } catch (cause) {
      registrarError(cause, 'No se pudo asignar la contraseña.')
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarAccion() {
    if (accion === null) return
    setGuardando(true)
    setErrorFormulario(null)
    try {
      const { usuario, tipo } = accion
      const alcance = usuario.empresa_id ?? undefined
      if (tipo === 'activar') await usuariosApi.activate(usuario.id, alcance)
      if (tipo === 'desactivar') await usuariosApi.deactivate(usuario.id, alcance)
      if (tipo === 'eliminar') await usuariosApi.remove(usuario.id, alcance)
      if (tipo === 'restaurar') await usuariosApi.restore(usuario.id, alcance)
      if (tipo === 'desbloquear') await usuariosApi.unlock(usuario.id, alcance)
      setAccion(null)
      setMensaje(`${TITULO_ACCION[tipo]}: operación completada.`)
      await cargar()
    } catch (cause) {
      setErrorFormulario(cause instanceof Error ? cause.message : 'No se pudo completar la acción.')
    } finally {
      setGuardando(false)
    }
  }

  const columnas: Column<User>[] = [
    {
      key: 'colaborador',
      header: esVistaGlobal ? 'Administrador' : 'Colaborador',
      render: (usuario) => (
        <>
          <strong>
            {usuario.nombre} {usuario.apellido}
          </strong>
          <small>
            @{usuario.username}
            {usuario.telefono != null && usuario.telefono !== '' ? ` · ${usuario.telefono}` : ''}
          </small>
        </>
      ),
    },
    { key: 'email', header: 'Correo', render: (usuario) => usuario.email },
    {
      key: 'ambito',
      header: 'Ámbito',
      render: (usuario) =>
        usuario.empresa_id == null ? <Badge tone="brand">Plataforma</Badge> : <Badge tone="neutral">Empresa</Badge>,
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (usuario) =>
        usuario.roles !== undefined && usuario.roles.length > 0 ? (
          <div className="badge-list">
            {usuario.roles.map((rol) => (
              <Badge key={rol} tone="neutral">
                {rol}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted">Sin roles</span>
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (usuario) => {
        if (usuario.is_deleted) return <Badge tone="danger">Eliminado</Badge>
        if (usuario.locked_until != null) return <Badge tone="warning">Bloqueado</Badge>
        if (!usuario.is_active) return <Badge tone="warning">Inactivo</Badge>
        if (!usuario.email_verified) return <Badge tone="info">Sin verificar</Badge>
        return <Badge tone="success">Activo</Badge>
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (usuario) => (
        <div className="row-actions">
          {usuario.is_deleted ? (
            <Can permisos={PERM_RESTAURAR}>
              <Button variant="secondary" size="sm" onClick={() => setAccion({ usuario, tipo: 'restaurar' })}>
                Restaurar
              </Button>
            </Can>
          ) : (
            <>
              <Can permisos={PERM_EDITAR}>
                <Button variant="secondary" size="sm" onClick={() => empezarEdicion(usuario)}>
                  Editar
                </Button>
              </Can>
              <Can permisos={PERM_PASSWORD}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    limpiarErrores()
                    setNuevaClave('')
                    setCambiandoClave(usuario)
                  }}
                >
                  Contraseña
                </Button>
              </Can>
              <Can permisos={PERM_EDITAR}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setAccion({ usuario, tipo: usuario.is_active ? 'desactivar' : 'activar' })
                  }
                >
                  {usuario.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </Can>
              {usuario.locked_until != null && (
                <Can permisos={PERM_DESBLOQUEAR}>
                  <Button variant="ghost" size="sm" onClick={() => setAccion({ usuario, tipo: 'desbloquear' })}>
                    Desbloquear
                  </Button>
                </Can>
              )}
              <Can permisos={PERM_ELIMINAR}>
                <Button
                  variant="danger-outline"
                  size="sm"
                  onClick={() => setAccion({ usuario, tipo: 'eliminar' })}
                >
                  Eliminar
                </Button>
              </Can>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow={esVistaGlobal ? 'Plataforma' : 'Administración'}
        title={esVistaGlobal ? 'Administradores globales' : 'Usuarios'}
        description={
          esVistaGlobal
            ? 'Cuentas con acceso a la administración de la plataforma.'
            : 'Colaboradores de la empresa activa, sus roles y sus credenciales.'
        }
        actions={
          <Can permisos={PERM_CREAR}>
            <Button
              onClick={() => {
                limpiarErrores()
                setCreateForm(FORM_VACIO)
                setShowCreate(true)
              }}
            >
              {esVistaGlobal ? 'Nuevo administrador' : 'Nuevo usuario'}
            </Button>
          </Can>
        }
      />

      {!can(...PERM_VER) && (
        <Alert tone="info" title="Permisos insuficientes">
          Tu rol no incluye el permiso para consultar usuarios. El listado puede aparecer vacío.
        </Alert>
      )}

      {mensaje !== null && <Alert tone="success">{mensaje}</Alert>}

      <Panel
        title="Directorio"
        count={`${total} ${esVistaGlobal
          ? (total === 1 ? 'administrador' : 'administradores')
          : (total === 1 ? 'usuario' : 'usuarios')}`}
      >
        <UsuarioFiltros
          search={search}
          onSearchChange={setSearch}
          estadoFiltro={estadoFiltro}
          onEstadoFiltroChange={(valor) => {
            setPage(1)
            setEstadoFiltro(valor)
          }}
          incluirEliminados={incluirEliminados}
          onIncluirEliminadosChange={(valor) => {
            setPage(1)
            setIncluirEliminados(valor)
          }}
          onSubmit={(evento) => {
            evento.preventDefault()
            setPage(1)
            setBusqueda(search)
          }}
        />

        <DataTable
          columns={columnas}
          rows={usuarios}
          rowKey={(usuario) => usuario.id}
          loading={loading}
          error={error}
          onRetry={() => void cargar()}
          emptyMessage={
            esVistaGlobal
              ? 'No hay administradores globales que coincidan con la búsqueda.'
              : 'No hay usuarios que coincidan con la búsqueda.'
          }
          caption={esVistaGlobal ? 'Administradores globales' : 'Usuarios de la empresa activa'}
        />

        {!loading && error === null && total > 0 && (
          <Pagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
            onPerPageChange={(valor) => {
              setPerPage(valor)
              setPage(1)
            }}
          />
        )}
      </Panel>

      {showCreate && (
        <UsuarioModalCrear
          esVistaGlobal={esVistaGlobal}
          roles={roles}
          rolesError={rolesError}
          valores={createForm}
          cambiar={setCreateForm}
          guardando={guardando}
          errorFormulario={errorFormulario}
          erroresCampo={erroresCampo}
          onClose={() => setShowCreate(false)}
          onSubmit={(evento) => void crear(evento)}
        />
      )}

      {editando !== null && (
        <UsuarioModalEditar
          usuario={editando}
          roles={roles}
          rolesError={rolesError}
          valores={editForm}
          cambiar={setEditForm}
          guardando={guardando}
          errorFormulario={errorFormulario}
          erroresCampo={erroresCampo}
          esVistaGlobal={esVistaGlobal}
          onClose={() => setEditando(null)}
          onSubmit={(evento) => void actualizar(evento)}
        />
      )}

      {cambiandoClave !== null && (
        <UsuarioModalClave
          usuario={cambiandoClave}
          nuevaClave={nuevaClave}
          onNuevaClaveChange={setNuevaClave}
          exigirCambio={exigirCambio}
          onExigirCambioChange={setExigirCambio}
          guardando={guardando}
          errorFormulario={errorFormulario}
          erroresCampo={erroresCampo}
          onClose={() => setCambiandoClave(null)}
          onSubmit={(evento) => void asignarClave(evento)}
        />
      )}

      {accion !== null && (
        <ConfirmDialog
          title={TITULO_ACCION[accion.tipo]}
          message={
            <>
              <p>
                <strong>
                  {accion.usuario.nombre} {accion.usuario.apellido}
                </strong>{' '}
                (@{accion.usuario.username})
              </p>
              <p>{DETALLE_ACCION[accion.tipo]}</p>
            </>
          }
          confirmLabel={TITULO_ACCION[accion.tipo].split(' ')[0]}
          tone={accion.tipo === 'eliminar' || accion.tipo === 'desactivar' ? 'danger' : 'primary'}
          loading={guardando}
          error={errorFormulario}
          onConfirm={() => void confirmarAccion()}
          onCancel={() => {
            setAccion(null)
            setErrorFormulario(null)
          }}
        />
      )}
    </section>
  )
}
