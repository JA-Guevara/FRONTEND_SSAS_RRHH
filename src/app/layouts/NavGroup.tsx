import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { GROUP_ICONS, type NavItem } from '../access/navigation'

export type NavGroupProps = {
  grupo: string
  entradas: NavItem[]
  index: number
  open: boolean
  onToggle: () => void
  onNavigate: () => void
}

export function NavGroup({
  grupo,
  entradas,
  index,
  open,
  onToggle,
  onNavigate,
}: NavGroupProps) {
  const GroupIcon = GROUP_ICONS[grupo]

  return (
    <div className="nav-group">
      {grupo !== '' && (
        <button
          className={`nav-group-title${open ? ' nav-group-title-open' : ''}`}
          type="button"
          aria-expanded={open}
          aria-controls={`nav-group-${index}`}
          onClick={onToggle}
        >
          {GroupIcon && <GroupIcon size={17} aria-hidden="true" />}
          <span>{grupo}</span>
          <ChevronDown className="nav-group-chevron" size={16} aria-hidden="true" />
        </button>
      )}
      <div
        id={`nav-group-${index}`}
        className="nav-group-links"
        hidden={grupo !== '' && !open}
      >
        {entradas.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
            >
              {Icon && <Icon size={17} aria-hidden="true" />}
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
