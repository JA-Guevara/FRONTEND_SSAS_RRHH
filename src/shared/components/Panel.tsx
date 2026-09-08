import type { ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
  title?: string
  eyebrow?: string
  count?: ReactNode
  actions?: ReactNode
  className?: string
}

export function Panel({ children, title, eyebrow, count, actions, className = '' }: PanelProps) {
  const hasHeading = title !== undefined || actions !== undefined || count !== undefined
  return (
    <section className={['panel', className].filter(Boolean).join(' ')}>
      {hasHeading && (
        <div className="panel-heading">
          <div>
            {eyebrow !== undefined && <p className="eyebrow">{eyebrow}</p>}
            {title !== undefined && <h2>{title}</h2>}
            {count !== undefined && <p className="panel-count">{count}</p>}
          </div>
          {actions !== undefined && <div className="row-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
