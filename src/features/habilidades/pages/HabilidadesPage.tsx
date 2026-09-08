import { useEffect, useState, type FormEvent } from 'react'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'
import { Alert, Badge, Button, Field, Modal, PageHeader, Panel } from '../../../shared/components'
import {
  actualizarHabilidad,
  crearHabilidad,
  listarHabilidades,
  type Habilidad,
} from '../api/habilidadesApi'

export function HabilidadesPage() {
  const { company } = useCompanyScope()
  const [items, setItems] = useState<Habilidad[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Habilidad | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Modal Form State
  const [formNombre, setFormNombre] = useState('')
  const [formCategoria, setFormCategoria] = useState('Técnica')
  const [formDescripcion, setFormDescripcion] = useState('')
  const [formActivo, setFormActivo] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listarHabilidades(company?.id)
      setItems(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las habilidades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [company?.id])

  function openCreate() {
    setEditing(null)
    setFormNombre('')
    setFormCategoria('Técnica')
    setFormDescripcion('')
    setFormActivo(true)
    setShowModal(true)
  }

  function openEdit(item: Habilidad) {
    setEditing(item)
    setFormNombre(item.nombre)
    setFormCategoria(item.categoria ?? 'General')
    setFormDescripcion(item.descripcion ?? '')
    setFormActivo(item.activo)
    setShowModal(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formNombre.trim()) return
    setSaving(true)
    setError(null)
    setMessage(null)

    const payload = {
      nombre: formNombre.trim(),
      categoria: formCategoria.trim() || null,
      descripcion: formDescripcion.trim() || null,
      activo: formActivo,
    }

    try {
      if (editing) {
        await actualizarHabilidad(editing.id, payload)
        setMessage(`Habilidad "${formNombre}" actualizada correctamente.`)
      } else {
        await crearHabilidad(payload)
        setMessage(`Habilidad "${formNombre}" agregada al catálogo.`)
      }
      setShowModal(false)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la habilidad.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(item: Habilidad) {
    try {
      await actualizarHabilidad(item.id, { activo: !item.activo })
      setMessage(`Estado de "${item.nombre}" cambiado a ${!item.activo ? 'activo' : 'inactivo'}.`)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar el estado.')
    }
  }

  const filteredItems = items.filter((item) => {
    const s = search.toLowerCase()
    return (
      item.nombre.toLowerCase().includes(s) ||
      (item.categoria && item.categoria.toLowerCase().includes(s))
    )
  })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageHeader
        eyebrow="Reclutamiento y Selección"
        title="Catálogo de Habilidades y Competencias"
        description="Competencias técnicas y blandas utilizadas para calificar candidatos y asociar requisitos a vacantes."
        actions={
          <Button variant="primary" onClick={openCreate}>
            + Nueva habilidad
          </Button>
        }
      />

      {message && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="success" title="Éxito">
            {message}
          </Alert>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert tone="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      <Panel
        title="Catálogo Institucional"
        eyebrow={`${items.length} habilidades configuradas`}
      >
        <div style={{ marginBottom: '1rem', maxWidth: 400 }}>
          <input
            className="input"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando catálogo...</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontStyle: 'italic' }}>
            No se encontraron habilidades registradas.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Habilidad</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Categoría</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Descripción</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      {item.nombre}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge tone="neutral">{item.categoria || 'General'}</Badge>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                      {item.descripcion || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge tone={item.activo ? 'success' : 'warning'}>
                        {item.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>
                          ✏️ Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void toggleStatus(item)}
                        >
                          {item.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal Crear / Editar Habilidad */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editing ? `Editar Habilidad: ${editing.nombre}` : 'Nueva Habilidad'}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Nombre de la competencia o habilidad *">
              <input
                className="input"
                placeholder="Ej. Python, Liderazgo, SQL, Figma..."
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
              />
            </Field>

            <Field label="Categoría">
              <select
                className="input"
                value={formCategoria}
                onChange={(e) => setFormCategoria(e.target.value)}
              >
                <option value="Técnica">Técnica / Hard Skill</option>
                <option value="Blanda">Blanda / Soft Skill</option>
                <option value="Idioma">Idioma</option>
                <option value="Certificación">Certificación</option>
                <option value="Metodología">Metodología / Framework</option>
                <option value="General">General</option>
              </select>
            </Field>

            <Field label="Descripción de la competencia">
              <textarea
                className="input"
                rows={3}
                placeholder="Detalles sobre lo que califica esta competencia..."
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
              />
            </Field>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formActivo}
                onChange={(e) => setFormActivo(e.target.checked)}
              />
              Habilidad activa para asociar a vacantes
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={saving}>
                {editing ? 'Guardar cambios' : 'Crear habilidad'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
