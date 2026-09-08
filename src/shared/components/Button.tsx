import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'danger-outline'
  | 'quiet'
  | 'quiet-dark'

export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  block?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  type = 'button',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'button',
    `button-${variant}`,
    size === 'md' ? '' : `button-${size}`,
    block ? 'button-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button {...rest} type={type} className={classes} disabled={disabled === true || loading}>
      {loading && <span className="spinner spinner-sm" aria-hidden="true" />}
      {children}
    </button>
  )
}
