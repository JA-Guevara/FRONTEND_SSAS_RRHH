import type { ReactNode } from 'react'
import { PageHeader, type PageHeaderProps } from '../components/PageHeader'
import { Tabs, type TabItem } from '../components/Tabs'

export type DetailPageProps = {
  header: PageHeaderProps
  summary?: ReactNode
  tabs?: {
    items: TabItem[]
    active: string
    onChange: (id: string) => void
  }
  children: ReactNode
  dangerZone?: ReactNode
  className?: string
}

/** Plantilla estándar para fichas de detalle (Empleado, Vacante, Postulación). */
export function DetailPage({
  header,
  summary,
  tabs,
  children,
  dangerZone,
  className = '',
}: DetailPageProps) {
  return (
    <div className={`page-stack ${className}`.trim()}>
      <PageHeader {...header} />
      {summary && <div className="detail-summary">{summary}</div>}
      {tabs && (
        <Tabs
          items={tabs.items}
          active={tabs.active}
          onChange={tabs.onChange}
        />
      )}
      <div className="detail-content">{children}</div>
      {dangerZone && (
        <section aria-label="Zona de peligro" className="panel panel-danger stack-sm mt-4">
          {dangerZone}
        </section>
      )}
    </div>
  )
}
