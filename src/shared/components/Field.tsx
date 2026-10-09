import { cloneElement, isValidElement, useId, type ReactNode } from 'react'

export type FieldRenderProps = {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

export type FieldProps = {
  label: string
  children: ReactNode | ((props: FieldRenderProps) => ReactNode)
  error?: string | null
  hint?: string
  required?: boolean
  optional?: boolean
  className?: string
  group?: boolean
}

/**
 * Field v2: Etiqueta, control, pista y error con vinculación accesible WAI-ARIA
 * (useId, htmlFor, aria-invalid, aria-describedby).
 * Soporta render function: (props) => <input {...props} /> o elementos directos.
 */
export function Field({
  label,
  children,
  error,
  hint,
  required = false,
  optional = false,
  className = '',
  group = false,
}: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-error`
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined

  const classes = ['field', error ? 'field-invalid' : '', className].filter(Boolean).join(' ')

  let renderedChild: ReactNode
  if (typeof children === 'function') {
    renderedChild = (children as (props: FieldRenderProps) => ReactNode)({
      id,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy,
    })
  } else if (isValidElement(children) && typeof children.type === 'string') {
    const childProps = children.props as Record<string, unknown>
    renderedChild = cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      id: childProps.id || id,
      'aria-invalid': childProps['aria-invalid'] ?? (error ? true : undefined),
      'aria-describedby': childProps['aria-describedby'] || describedBy,
    })
  } else {
    renderedChild = children
  }

  const content = (
    <>
      <label htmlFor={group ? undefined : id} className="field-label-text">
        <span>{label}</span>
        {required && <span aria-hidden="true" className="field-req">*</span>}
        {optional && <span className="field-opt">(opcional)</span>}
      </label>
      {renderedChild}
      {hint !== undefined && error == null && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {error != null && (
        <span id={errId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </>
  )

  return group ? (
    <div className={classes} role="group" aria-label={label}>
      {content}
    </div>
  ) : (
    <div className={classes}>{content}</div>
  )
}
