import type { ReactNode } from 'react'

export type CardProps = {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  tone?: 'default' | 'muted' | 'danger'
  children: ReactNode
  className?: string
  footer?: ReactNode
}

export function Card({
  title,
  subtitle,
  actions,
  tone = 'default',
  children,
  className = '',
  footer,
}: CardProps) {
  const toneClass = tone === 'danger' ? 'card-danger' : tone === 'muted' ? 'card-muted' : ''
  const hasHeader = title || actions || subtitle

  return (
    <article className={`card ${toneClass} ${className}`.trim()}>
      {hasHeader && (
        <header className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </article>
  )
}
