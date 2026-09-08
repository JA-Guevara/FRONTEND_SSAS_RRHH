import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, LoadingBlock, PageHeader, Panel } from '../../../shared/components'
import type { components } from '../../../shared/api/schema'
import { empresasApi } from '../api/empresasApi'
import { modulosApi } from '../api/modulosApi'
import type { ModuloEmpresa } from '../api/modulosApi'

type Empresa = components['schemas']['EmpresaResponse']

export function EmpresaModulosPage() {
  const { empresaId = '' } = useParams()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [modulos, setModulos] = useState<ModuloEmpresa[]>([])
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [detalle, lista] = await Promise.all([
        empresasApi.get(empresaId),
        modulosApi.porEmpresa(empresaId),
      ])
      setEmpresa(detalle)
      setModulos(lista)
      setSeleccion(new Set(lista.filter((m) => m.habilitado).map((m) => m.codigo)))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los módulos.')
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    void cargar()
  }, [cargar])

  function alternar(codigo: string) {
    setMensaje(null)
    setSeleccion((actual) => {
      const siguiente = new Set(actual)
      if (siguiente.has(codigo)) siguiente.delete(codigo)
      else siguiente.add(codigo)
      return siguiente
    })
  }

  async function guardar() {
    setSaving(true)
    setError(null)
    setMensaje(null)
    try {
      const actualizados = await modulosApi.actualizar(empresaId, [...seleccion])
      setModulos(actualizados)
      setSeleccion(new Set(actualizados.filter((m) => m.habilitado).map((m) => m.codigo)))
      setMensaje('Módulos actualizados. Los usuarios de la empresa verán el cambio al recargar.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  const opcionales = modulos.filter((modulo) => !modulo.es_core)
  const nucleo = modulos.filter((modulo) => modulo.es_core)

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Administración global"
        title={empresa !== null ? `Módulos de ${empresa.nombre_comercial}` : 'Módulos de la empresa'}
        description="Define qué funcionalidades tiene contratadas esta empresa. Lo que deshabilites deja de estar disponible tanto en el menú como en la API."
        actions={
          <>
            <Link className="button button-secondary" to="/empresas">
              Volver
            </Link>
            <Button onClick={() => void guardar()} loading={saving} disabled={loading}>
              Guardar cambios
            </Button>
          </>
        }
      />

      {error !== null && <Alert tone="error">{error}</Alert>}
      {mensaje !== null && <Alert tone="success">{mensaje}</Alert>}

      {loading ? (
        <LoadingBlock message="Cargando módulos…" />
      ) : (
        <>
          <Panel
            title="Módulos contratables"
            count={`${opcionales.filter((m) => seleccion.has(m.codigo)).length} de ${opcionales.length} habilitados`}
          >
            <div className="card-grid">
              {opcionales.map((modulo) => (
                <label key={modulo.id} className="card check-label" style={{ alignItems: 'start' }}>
                  <input
                    type="checkbox"
                    checked={seleccion.has(modulo.codigo)}
                    onChange={() => alternar(modulo.codigo)}
                  />
                  <span>
                    <strong>{modulo.nombre}</strong>
                    <small className="text-muted">{modulo.descripcion ?? modulo.codigo}</small>
                  </span>
                </label>
              ))}
            </div>
          </Panel>

          <Panel
            title="Módulos incluidos"
            count="Forman parte de la administración básica y no se pueden deshabilitar"
          >
            <div className="card-grid">
              {nucleo.map((modulo) => (
                <div key={modulo.id} className="card">
                  <strong>{modulo.nombre}</strong>
                  <p>{modulo.descripcion ?? modulo.codigo}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </section>
  )
}
