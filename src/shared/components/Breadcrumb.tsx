import { Link } from 'react-router-dom'

export type BreadcrumbItem = {
  label: string
  to?: string
}

export type BreadcrumbProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Migas de pan" className={`breadcrumb ${className}`.trim()}>
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}
              {isLast || !item.to ? (
                <span className="breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
