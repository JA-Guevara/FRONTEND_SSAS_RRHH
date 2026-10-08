import type { ReactNode } from 'react'

export type FormRowProps = {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
  htmlFor?: string
}

export function FormRow({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
  htmlFor,
}: FormRowProps) {
  return (
    <div className={`form-row ${error ? 'field-invalid' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label} {required && <span aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && <span className="field-error">{error}</span>}
      {hint && !error && <span className="field-hint">{hint}</span>}
    </div>
  )
}
