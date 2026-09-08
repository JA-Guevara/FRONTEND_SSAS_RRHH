import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  eyebrow?: string
  description?: ReactNode
  actions?: ReactNode
}

/** Cabecera única de página: el mismo tamaño de título en todas las pantallas. */
export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow !== undefined && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description !== undefined && <p className="page-description">{description}</p>}
      </div>
      {actions !== undefined && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}
