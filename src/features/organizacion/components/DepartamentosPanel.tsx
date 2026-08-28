import { useMemo, useState, type FormEvent } from 'react'
import type { Departamento } from '../api/organizacionApi'
import { actualizarDepartamento, crearDepartamento } from '../api/organizacionApi'

type Props = {
  departamentos: Departamento[]
  onChanged: () => Promise<void>
}

type TreeNode = Departamento & { children: TreeNode[] }

function buildTree(items: Departamento[]): TreeNode[] {
  const map = new Map<number, TreeNode>()
  items.forEach((d) => map.set(d.id, { ...d, children: [] }))
  const roots: TreeNode[] = []
  map.forEach((node) => {
    if (node.departamento_padre_id && map.has(node.departamento_padre_id)) {
      map.get(node.departamento_padre_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export function DepartamentosPanel({ departamentos, onChanged }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [padreId, setPadreId] = useState<string>('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [saving, setSaving] = useState(false)

  const tree = useMemo(() => buildTree(departamentos), [departamentos])
  const selected = departamentos.find((d) => d.id === selectedId) ?? null

  function startCreate() {
    setSelectedId(null)
    setNombre('')
    setDescripcion('')
    setPadreId('')
    setError('')
    setOk('')
  }

  function startEdit(dep: Departamento) {
    setSelectedId(dep.id)
    setNombre(dep.nombre)
    setDescripcion(dep.descripcion)
    setPadreId(dep.departamento_padre_id ? String(dep.departamento_padre_id) : '')
    setError('')
    setOk('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setOk('')
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        departamento_padre_id: padreId ? Number(padreId) : null,
      }
      if (selected) {
        await actualizarDepartamento(selected.id, payload)
        setOk('Departamento actualizado')
      } else {
        await crearDepartamento(payload)
        setOk('Departamento creado')
        startCreate()
      }
      await onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  function renderTree(nodes: TreeNode[]) {
    return (
      <ul className="org-tree">
        {nodes.map((n) => (
          <li key={n.id}>
            <div className={`org-node ${selectedId === n.id ? 'active' : ''}`}>
              <button type="button" className="org-actions" onClick={() => startEdit(n)} style={{ all: 'unset', cursor: 'pointer', flex: 1 }}>
                {n.nombre}
              </button>
              <button type="button" onClick={() => startEdit(n)}>Editar</button>
            </div>
            {n.children.length > 0 && renderTree(n.children)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="org-card">
      <h2>Departamentos</h2>
      <p className="org-sub">Árbol armado con departamento_padre_id</p>
      {renderTree(tree)}

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>{selected ? 'Editar departamento' : 'Nuevo departamento'}</h3>
        <label className="org-label">Nombre *</label>
        <input className="org-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label className="org-label">Departamento padre</label>
        <select className="org-select" value={padreId} onChange={(e) => setPadreId(e.target.value)}>
          <option value="">Ninguno (raíz)</option>
          {departamentos
            .filter((d) => d.id !== selectedId)
            .map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
        </select>

        <label className="org-label">Descripción</label>
        <textarea className="org-textarea" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

        {error && <div className="org-bad">{error}</div>}
        {ok && <div className="org-ok">{ok}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="org-btn" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : selected ? 'Guardar cambios' : 'Crear departamento'}
          </button>
          <button className="org-btn ghost" type="button" onClick={startCreate}>Nuevo</button>
        </div>
      </form>
    </section>
  )
}