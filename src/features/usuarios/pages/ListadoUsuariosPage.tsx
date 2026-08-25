import { useEffect, useState, type FormEvent } from 'react'

type Usuario = {
  id: number
  username: string
  email: string
  nombres: string
  apellidos: string
  rol: string
  activo: boolean
  ultimo_acceso: string | null
}

type FormData = {
  nombres: string
  apellidos: string
  email: string
  username: string
  rol: string
}

const MOCK_USUARIOS: Usuario[] = [
  { id: 1, username: 'mgutierrez', email: 'mgutierrez@textiles.bo', nombres: 'María', apellidos: 'Gutiérrez Vaca', rol: 'ADMIN_EMPRESA', activo: true, ultimo_acceso: '2026-08-18T08:15:00Z' },
  { id: 2, username: 'jperez', email: 'jperez@textiles.bo', nombres: 'Juan', apellidos: 'Pérez Rojas', rol: 'RECLUTADOR', activo: true, ultimo_acceso: '2026-08-17T16:40:00Z' },
  { id: 3, username: 'alopez', email: 'alopez@textiles.bo', nombres: 'Ana', apellidos: 'López Méndez', rol: 'ANALISTA_RRHH', activo: true, ultimo_acceso: '2026-08-16T09:12:00Z' },
  { id: 4, username: 'cmartinez', email: 'cmartinez@textiles.bo', nombres: 'Carlos', apellidos: 'Martínez Soto', rol: 'JEFE_AREA', activo: false, ultimo_acceso: '2026-08-10T14:30:00Z' },
  { id: 5, username: 'srodriguez', email: 'srodriguez@textiles.bo', nombres: 'Sofía', apellidos: 'Rodríguez Paz', rol: 'COLABORADOR', activo: true, ultimo_acceso: '2026-08-18T07:50:00Z' },
  { id: 6, username: 'dfernandez', email: 'dfernandez@textiles.bo', nombres: 'Diego', apellidos: 'Fernández Quispe', rol: 'RECLUTADOR', activo: true, ultimo_acceso: '2026-08-15T11:00:00Z' },
  { id: 7, username: 'lvaldez', email: 'lvaldez@textiles.bo', nombres: 'Laura', apellidos: 'Valdez Choque', rol: 'ANALISTA_RRHH', activo: false, ultimo_acceso: '2026-08-05T13:20:00Z' },
  { id: 8, username: 'rmendoza', email: 'rmendoza@textiles.bo', nombres: 'Roberto', apellidos: 'Mendoza Aliaga', rol: 'COLABORADOR', activo: true, ultimo_acceso: '2026-08-17T18:05:00Z' },
]

const emptyForm: FormData = {
  nombres: '',
  apellidos: '',
  email: '',
  username: '',
  rol: 'COLABORADOR',
}

export function ListadoUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rolFiltro, setRolFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [success, setSuccess] = useState('')
  const pageSize = 5

  useEffect(() => {
    const t = setTimeout(() => {
      setUsuarios(MOCK_USUARIOS)
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  const filtrados = usuarios.filter((u) => {
    const term = search.toLowerCase()
    const matchSearch =
      !term ||
      u.nombres.toLowerCase().includes(term) ||
      u.apellidos.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term)
    const matchRol = !rolFiltro || u.rol === rolFiltro
    return matchSearch && matchRol
  })

  const totalPages = Math.ceil(filtrados.length / pageSize) || 1
  const pagina = filtrados.slice((page - 1) * pageSize, page * pageSize)

  const formatFecha = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const nombreRol = (rol: string) =>
    ({
      ADMIN_EMPRESA: 'Admin Empresa',
      ANALISTA_RRHH: 'Analista RRHH',
      RECLUTADOR: 'Reclutador',
      JEFE_AREA: 'Jefe de Área',
      COLABORADOR: 'Colaborador',
    }[rol] || rol)

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.nombres.trim()) e.nombres = 'Obligatorio'
    if (!form.apellidos.trim()) e.apellidos = 'Obligatorio'
    if (!form.email.trim()) e.email = 'Obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.username.trim()) e.username = 'Obligatorio'
    if (usuarios.some((u) => u.email === form.email.trim())) e.email = 'Email ya registrado'
    if (usuarios.some((u) => u.username === form.username.trim())) e.username = 'Usuario ya existe'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = (ev: FormEvent) => {
    ev.preventDefault()
    setSuccess('')
    if (!validate()) return

    const nuevo: Usuario = {
      id: Math.max(0, ...usuarios.map((u) => u.id)) + 1,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      rol: form.rol,
      activo: true,
      ultimo_acceso: new Date().toISOString(),
    }

    setUsuarios((prev) => [nuevo, ...prev])
    setForm(emptyForm)
    setShowForm(false)
    setSuccess('Usuario creado correctamente')
    setPage(1)
  }

  const handleCambiarEstado = (id: number) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)))
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Listado de Usuarios</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setSuccess('')
            setErrors({})
          }}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {success && (
        <p style={{ background: '#dcfce7', color: '#166534', padding: 10, borderRadius: 6 }}>{success}</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20, display: 'grid', gap: 12, maxWidth: 520 }}>
          <h3 style={{ margin: 0 }}>Alta de usuario</h3>
          {([
            ['nombres', 'Nombres'],
            ['apellidos', 'Apellidos'],
            ['email', 'Email'],
            ['username', 'Usuario'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label style={{ display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: errors[key] ? '1px solid #dc2626' : '1px solid #d1d5db' }}
              />
              {errors[key] && <small style={{ color: '#dc2626' }}>{errors[key]}</small>}
            </div>
          ))}
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Rol</label>
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}>
              <option value="ADMIN_EMPRESA">Admin Empresa</option>
              <option value="ANALISTA_RRHH">Analista RRHH</option>
              <option value="RECLUTADOR">Reclutador</option>
              <option value="JEFE_AREA">Jefe de Área</option>
              <option value="COLABORADOR">Colaborador</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Buscar por nombre, email o usuario..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6, width: 280 }} />
        <select value={rolFiltro} onChange={(e) => { setRolFiltro(e.target.value); setPage(1) }} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}>
          <option value="">Todos los roles</option>
          <option value="ADMIN_EMPRESA">Admin Empresa</option>
          <option value="ANALISTA_RRHH">Analista RRHH</option>
          <option value="RECLUTADOR">Reclutador</option>
          <option value="JEFE_AREA">Jefe de Área</option>
          <option value="COLABORADOR">Colaborador</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Nombre</th>
                  <th style={{ padding: 12 }}>Email</th>
                  <th style={{ padding: 12 }}>Rol</th>
                  <th style={{ padding: 12 }}>Estado</th>
                  <th style={{ padding: 12 }}>Último acceso</th>
                  <th style={{ padding: 12 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagina.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 500 }}>{u.nombres} {u.apellidos}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: 12 }}>{u.email}</td>
                    <td style={{ padding: 12 }}>{nombreRol(u.rol)}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, background: u.activo ? '#dcfce7' : '#fee2e2', color: u.activo ? '#166534' : '#991b1b' }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>{formatFecha(u.ultimo_acceso)}</td>
                    <td style={{ padding: 12 }}>
                      <button onClick={() => handleCambiarEstado(u.id)} style={{ background: 'none', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>Mostrando {pagina.length} de {filtrados.length} usuarios</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <span>Página {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}