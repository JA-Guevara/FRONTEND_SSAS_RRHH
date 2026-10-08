export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  hint?: string
  name?: string
  id?: string
  required?: boolean
  className?: string
}

export function Select({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
  hint,
  name,
  id,
  required = false,
  className = '',
}: SelectProps) {
  const selectId = id || name || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className={`field ${error ? 'field-invalid' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label} {required && <span aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="select"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
      {hint && !error && <span className="field-hint">{hint}</span>}
    </div>
  )
}
