import type { ReactNode } from 'react'
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb'

export type PageHeaderProps = {
  title: string
  eyebrow?: string
  subtitle?: ReactNode
  description?: ReactNode
  breadcrumb?: BreadcrumbItem[]
  actions?: ReactNode
  tone?: 'default' | 'danger'
}

/** Cabecera única de página: título, subtítulo contextual, migas y acciones. */
export function PageHeader({
  title,
  eyebrow,
  subtitle,
  description,
  breadcrumb,
  actions,
  tone = 'default',
}: PageHeaderProps) {
  const subContent = subtitle ?? description

  return (
    <header className={`page-header ${tone === 'danger' ? 'page-header-danger' : ''}`.trim()}>
      <div className="page-header-main">
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
        {eyebrow !== undefined && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subContent !== undefined && <p className="page-header-subtitle">{subContent}</p>}
      </div>
      {actions !== undefined && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}
