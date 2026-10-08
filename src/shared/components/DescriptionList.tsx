import type { ReactNode } from 'react'

export type DescriptionItem = {
  label: ReactNode
  value: ReactNode
  key?: string
}

export type DescriptionListProps = {
  items: DescriptionItem[]
  className?: string
}

export function DescriptionList({ items, className = '' }: DescriptionListProps) {
  if (!items || items.length === 0) return null

  return (
    <dl className={`description-list ${className}`.trim()}>
      {items.map((item, idx) => (
        <div key={item.key || idx} className="description-item">
          <dt className="description-term">{item.label}</dt>
          <dd className="description-details">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
