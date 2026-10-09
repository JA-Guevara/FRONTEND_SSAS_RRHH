import { useSearchParams } from 'react-router-dom'
import { PageHeader, Tabs, type TabItem } from '../../../shared/components'
import { AltaEmpresaPage } from './AltaEmpresaPage'
import { ListadoUsuariosPage } from '../../usuarios/pages/ListadoUsuariosPage'
import { PlanesPage } from '../../suscripciones/pages/PlanesPage'
import { RespaldosPage } from '../../respaldos/pages/RespaldosPage'

const TABS: TabItem[] = [
  { id: 'empresas', label: 'Empresas cliente' },
  { id: 'usuarios', label: 'Administradores globales' },
  { id: 'planes', label: 'Planes SaaS' },
  { id: 'respaldos', label: 'Copias de seguridad' },
]

export function PlataformaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'empresas'

  function handleTabChange(tabId: string) {
    setSearchParams({ tab: tabId })
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Consola Global"
        title="Administración de la Plataforma"
        subtitle="Control centralizado de organizaciones clientes, usuarios globales, planes comerciales y respaldos del sistema."
      />

      <Tabs items={TABS} active={activeTab} onChange={handleTabChange} />

      {activeTab === 'empresas' && <AltaEmpresaPage />}
      {activeTab === 'usuarios' && <ListadoUsuariosPage scope="platform" />}
      {activeTab === 'planes' && <PlanesPage />}
      {activeTab === 'respaldos' && <RespaldosPage />}
    </div>
  )
}
