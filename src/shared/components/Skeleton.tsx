export type SkeletonProps = {
  rows?: number
  variant?: 'text' | 'rect' | 'circle' | 'table'
  className?: string
}

export function Skeleton({
  rows = 3,
  variant = 'text',
  className = '',
}: SkeletonProps) {
  if (variant === 'circle') {
    return <div aria-hidden="true" className={`skeleton skeleton-circle ${className}`.trim()} />
  }

  if (variant === 'rect') {
    return <div aria-hidden="true" className={`skeleton skeleton-rect ${className}`.trim()} />
  }

  if (variant === 'table') {
    return (
      <div aria-hidden="true" className={`table-wrap ${className}`.trim()}>
        <table>
          <tbody>
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx}>
                <td><div className="skeleton skeleton-row" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className={`stack-sm ${className}`.trim()}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton skeleton-text" />
      ))}
    </div>
  )
}
