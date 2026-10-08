import { useState } from 'react'
import './avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type AvatarProps = {
  src?: string | null
  name?: string | null
  id?: string | null
  size?: AvatarSize
  className?: string
  alt?: string
}

const DETERMINISTIC_PALETTE = [
  '#2d6a4f', // verde bosque
  '#1d4ed8', // azul real
  '#7c3aed', // púrpura
  '#b45309', // ámbar oscuro
  '#0f766e', // verde azulado
  '#be185d', // rosa oscuro
  '#4338ca', // índigo
  '#0369a1', // azul cielo oscuro
]

export function getDeterministicColor(identifier: string): string {
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % DETERMINISTIC_PALETTE.length
  return DETERMINISTIC_PALETTE[index]
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  name,
  id,
  size = 'md',
  className = '',
  alt,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false)
  const initials = getInitials(name)
  const bgColor = getDeterministicColor(id || name || 'default')
  const ariaLabel = alt || name || 'Avatar de usuario'

  const showImage = Boolean(src && !hasError)

  return (
    <div
      className={`ui-avatar ui-avatar-${size} ${className}`.trim()}
      style={!showImage ? { backgroundColor: bgColor } : undefined}
      aria-label={ariaLabel}
      role="img"
    >
      {showImage ? (
        <img
          src={src as string}
          alt={ariaLabel}
          className="ui-avatar-img"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="ui-avatar-initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  )
}
