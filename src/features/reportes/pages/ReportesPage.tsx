import { useEffect, useState } from 'react'
import { BarChart3, Compass, Sparkles } from 'lucide-react'
import { PageHeader } from '../../../shared/components'
import { reportesApi, type Source } from '../api/reportesApi'
import { ConstructorView } from './ConstructorView'
import { ExploradorView } from './ExploradorView'
import { PanelView } from './PanelView'

export type ReportesTab = 'panel' | 'explorar' | 'construir'

type ReportesPageProps = {
  initialTab?: ReportesTab
}

export function ReportesPage({ initialTab = 'construir' }: ReportesPageProps) {
  const [activeTab, setActiveTab] = useState<ReportesTab>(initialTab)
  const [sources, setSources] = useState<Source[]>([])
  const [catalogError, setCatalogError] = useState<string | null>(null)

  useEffect(() => {
    reportesApi
      .catalog()
      .then((items) => {
        setSources(items)
      })
      .catch((error: Error) => {
        setCatalogError(error.message)
      })
  }, [])

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Análisis de plataforma"
        title="Módulo de Reportes"
        description="Panel de indicadores en tiempo real, explorador de datos con exportación profesional y constructor asistido por IA."
      />

      {catalogError && (
        <div className="report-count-banner report-count-banner-warn">
          <span>{catalogError}</span>
        </div>
      )}

      {/* Navegación por tres vistas semánticas (§3) */}
      <nav className="report-tabs" role="tablist" aria-label="Vistas del módulo de reportes">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'panel'}
          className={`report-tab-btn ${activeTab === 'panel' ? 'report-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('panel')}
        >
          <BarChart3 size={16} aria-hidden="true" />
          <span>Panel de indicadores</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'explorar'}
          className={`report-tab-btn ${activeTab === 'explorar' ? 'report-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('explorar')}
        >
          <Compass size={16} aria-hidden="true" />
          <span>Explorador de datos</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'construir'}
          className={`report-tab-btn ${activeTab === 'construir' ? 'report-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('construir')}
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>Constructor</span>
        </button>
      </nav>

      {/* Renderizado de superficie seleccionada */}
      {activeTab === 'panel' && (
        <PanelView onNavigateToBuilder={() => setActiveTab('construir')} />
      )}

      {activeTab === 'explorar' && (
        <ExploradorView
          sources={sources}
          onNavigateToBuilder={() => setActiveTab('construir')}
        />
      )}

      {activeTab === 'construir' && (
        <ConstructorView
          sources={sources}
          onSavedReport={() => setActiveTab('explorar')}
          onPinnedToPanel={() => setActiveTab('panel')}
        />
      )}
    </section>
  )
}
