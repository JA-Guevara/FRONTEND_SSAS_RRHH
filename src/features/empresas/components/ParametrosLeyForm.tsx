import { useEffect, useState } from 'react'
import type { components } from '../../../shared/api/schema'
import { empresasApi } from '../api/empresasApi'

type Parameter = components['schemas']['ParametroEmpresaResponse']

export function ParametrosLeyForm() {
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  async function load() {
    setStatus('loading')
    try {
      const data = await empresasApi.listParameters()
      setParameters(data)
      setValues(Object.fromEntries(data.map((item) => [item.codigo, item.valor ?? ''])))
      setStatus('success')
    } catch { setStatus('error') }
  }
  useEffect(() => { void load() }, [])

  async function save(parameter: Parameter) {
    const value = values[parameter.codigo]?.trim() ?? ''
    if (!value || Number.isNaN(Number(value))) { setMessage('El valor debe ser numérico.'); return }
    try {
      await empresasApi.updateParameter(parameter.codigo, {
        valor: value,
        vigente_desde: parameter.vigente_desde ?? new Date().toISOString().slice(0, 10),
        vigente_hasta: parameter.vigente_hasta,
        norma_legal: parameter.norma_legal,
      })
      setMessage(`${parameter.nombre} actualizado correctamente.`)
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar') }
  }

  if (status === 'loading') return <p>Cargando parámetros…</p>
  if (status === 'error') return <p className="form-error">No se pudieron consultar los parámetros.</p>
  return <div className="panel">{message && <p className="notice">{message}</p>}<div className="permission-list">{parameters.map((parameter) => <div className="permission-row" key={parameter.codigo}><div><strong>{parameter.nombre}</strong><small>{parameter.codigo} · {parameter.norma_legal ?? 'Sin norma registrada'}</small></div><div className="row-actions"><input aria-label={`Valor de ${parameter.nombre}`} value={values[parameter.codigo] ?? ''} onChange={(e) => setValues({ ...values, [parameter.codigo]: e.target.value })} /><button onClick={() => void save(parameter)} type="button">Guardar</button></div></div>)}</div>{parameters.length === 0 && <div className="empty-table">No hay parámetros configurados.</div>}</div>
}
