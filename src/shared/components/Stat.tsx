import type { ReactNode } from 'react'

export type StatProps = {
  label: string
  value: ReactNode
  delta?: {
    value: string | number
    isPositive?: boolean
  }
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'brand'
  icon?: ReactNode
  className?: string
  onClick?: () => void
}

export function Stat({
  label,
  value,
  delta,
  tone = 'default',
  icon,
  className = '',
  onClick,
}: StatProps) {
  const content = (
    <>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
      <div className="row-between">
        <span className="stat-value">{value}</span>
        {delta && (
          <span className={`stat-delta ${delta.isPositive ? 'positive' : 'negative'}`}>
            {delta.isPositive ? '↑' : '↓'} {delta.value}
          </span>
        )}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`stat stat-${tone} ${className}`.trim()}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`stat stat-${tone} ${className}`.trim()}>
      {content}
    </div>
  )
}
