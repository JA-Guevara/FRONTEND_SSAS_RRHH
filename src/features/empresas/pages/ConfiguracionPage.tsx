import { useSearchParams } from 'react-router-dom'
import { PageHeader, Tabs, type TabItem } from '../../../shared/components'
import { ConfiguracionEmpresaPage } from './ConfiguracionEmpresaPage'
import { HabilidadesPage } from '../../habilidades/pages/HabilidadesPage'
import { ImportacionPage } from '../../importacion/pages/ImportacionPage'
import { AyudaPage } from '../../ayuda/pages/AyudaPage'
import { EmpresaModulosPage } from './EmpresaModulosPage'
import { useCompanyScope } from '../../../app/context/CompanyScopeContext'

const TABS: TabItem[] = [
  { id: 'general', label: 'General' },
  { id: 'portal', label: 'Portal de empleo' },
  { id: 'catalogos', label: 'Catálogos' },
  { id: 'importaciones', label: 'Importaciones' },
  { id: 'conocimiento', label: 'Base de conocimiento' },
  { id: 'modulos', label: 'Módulos' },
]

export function ConfiguracionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'general'
  const { company } = useCompanyScope()

  function handleTabChange(tabId: string) {
    setSearchParams({ tab: tabId })
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={company ? company.nombre_comercial : 'Administración'}
        title="Configuración de la Empresa"
        subtitle="Administra la identidad corporativa, portal de empleo, catálogos, importaciones masivas y módulos activos."
      />

      <Tabs items={TABS} active={activeTab} onChange={handleTabChange} />

      {activeTab === 'general' && <ConfiguracionEmpresaPage initialTab="general" />}
      {activeTab === 'portal' && <ConfiguracionEmpresaPage initialTab="portal" />}
      {activeTab === 'catalogos' && <HabilidadesPage />}
      {activeTab === 'importaciones' && <ImportacionPage />}
      {activeTab === 'conocimiento' && <AyudaPage />}
      {activeTab === 'modulos' && <EmpresaModulosPage empresaIdOverride={company?.id} />}
    </div>
  )
}
