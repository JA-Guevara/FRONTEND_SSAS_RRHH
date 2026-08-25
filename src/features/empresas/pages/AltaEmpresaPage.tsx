import { useEffect, useState } from 'react'
import type { components } from '../../../shared/api/schema'
import { AltaEmpresaForm } from '../components/AltaEmpresaForm'
import { empresasApi } from '../api/empresasApi'

type Company = components['schemas']['EmpresaResponse']

export function AltaEmpresaPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [showForm, setShowForm] = useState(false)
  async function load() { try { setCompanies((await empresasApi.list()).items) } catch { setCompanies([]) } }
  useEffect(() => { void load() }, [])
  return <section className="page-stack"><div className="page-header"><div><p className="eyebrow">Administración global</p><h1>Empresas</h1><p className="page-description">Aprovisionamiento de empresas mediante la API de plataforma.</p></div><button className="button button-primary" onClick={() => setShowForm(!showForm)} type="button">{showForm ? 'Cerrar formulario' : 'Nueva empresa'}</button></div>{showForm && <AltaEmpresaForm onCreated={() => { setShowForm(false); void load() }} />}<section className="panel"><div className="table-wrap"><table><thead><tr><th>Empresa</th><th>Slug</th><th>NIT</th><th>Estado</th></tr></thead><tbody>{companies.map((company) => <tr key={company.id}><td><strong>{company.nombre_comercial}</strong><small>{company.razon_social}</small></td><td>{company.slug}</td><td>{company.nit ?? '—'}</td><td>{company.activo ? 'Activa' : 'Suspendida'}</td></tr>)}</tbody></table>{companies.length === 0 && <div className="empty-table">No hay empresas o no fue posible consultarlas.</div>}</div></section></section>
}
