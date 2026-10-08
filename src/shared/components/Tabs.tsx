export type TabItem = {
  id: string
  label: string
  count?: number
}

export type TabsProps = {
  items: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ items, active, onChange, className = '' }: TabsProps) {
  return (
    <div role="tablist" className={`tabs ${className}`.trim()}>
      {items.map((item) => {
        const isSelected = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={`tab ${isSelected ? 'selected' : ''}`.trim()}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span className="badge badge-neutral">
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
