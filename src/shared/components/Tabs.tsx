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
  variant?: 'barra' | 'riel'
  mobileAs?: 'scroll' | 'select'
}

export function Tabs({
  items,
  active,
  onChange,
  className = '',
  variant = 'barra',
  mobileAs,
}: TabsProps) {
  const esRiel = variant === 'riel'
  const conSelector = esRiel && (mobileAs ?? 'select') === 'select'

  const tablist = (
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

  if (!esRiel) return tablist

  return (
    <div className={`tabs-rail${conSelector ? '' : ' tabs-rail-scroll'}`}>
      {tablist}
      {conSelector && (
        <select
          className="tabs-select"
          aria-label="Sección"
          value={active}
          onChange={(event) => onChange(event.target.value)}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
              {typeof item.count === 'number' ? ` (${item.count})` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
