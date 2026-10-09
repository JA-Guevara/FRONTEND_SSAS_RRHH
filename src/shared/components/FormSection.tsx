import type { ReactNode } from 'react'

export type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  as?: 'fieldset' | 'section' | 'div'
}

/**
 * Agrupa campos de formulario con título, descripción y ritmo visual estandarizado.
 */
export function FormSection({
  title,
  description,
  children,
  className = '',
  as: Component = 'section',
}: FormSectionProps) {
  const classes = ['form-section', className].filter(Boolean).join(' ')

  if (Component === 'fieldset') {
    return (
      <fieldset className={classes}>
        <legend className="form-section-title">{title}</legend>
        {description && <p className="form-section-desc">{description}</p>}
        {children}
      </fieldset>
    )
  }

  return (
    <Component className={classes}>
      <header className="form-section-header">
        <h3 className="form-section-title">{title}</h3>
        {description && <p className="form-section-desc">{description}</p>}
      </header>
      {children}
    </Component>
  )
}
