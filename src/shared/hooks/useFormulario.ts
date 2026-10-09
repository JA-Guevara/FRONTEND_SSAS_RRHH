import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react'

export type ValidationErrors<T> = Partial<Record<keyof T, string>>

export type UseFormularioOptions<T extends Record<string, unknown>> = {
  initialValues: T
  validate?: (values: T) => ValidationErrors<T> | Promise<ValidationErrors<T>>
  onSubmit: (values: T) => Promise<void> | void
  warnUnsaved?: boolean
}

/**
 * Hook de gestión de formularios con:
 * - Validación al desenfocar (blur) o al enviar
 * - Enfoque automático en el primer campo con error (§6.5)
 * - Mapeo de errores de servidor campo por campo
 * - Protección contra salida accidental si hay cambios sin guardar (beforeunload)
 * - Estado isSubmitting para deshabilitar botones solo durante el despacho
 */
export function useFormulario<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
  warnUnsaved = true,
}: UseFormularioOptions<T>) {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const initialValuesRef = useRef<T>(initialValues)

  // Aviso al salir con cambios sin guardar (§6.5)
  useEffect(() => {
    if (!warnUnsaved || !isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [warnUnsaved, isDirty])

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState(prev => {
      const next = { ...prev, [field]: value }
      setIsDirty(JSON.stringify(next) !== JSON.stringify(initialValuesRef.current))
      return next
    })
  }, [])

  const handleBlur = useCallback(
    async (field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }))
      if (validate) {
        const validationErrors = await validate(values)
        setErrors(prev => ({
          ...prev,
          [field]: validationErrors[field],
        }))
      }
    },
    [validate, values]
  )

  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors(prev => {
      const next = { ...prev }
      if (error) {
        next[field] = error
      } else {
        delete next[field]
      }
      return next
    })
  }, [])

  const setFieldsErrors = useCallback((fieldErrors: ValidationErrors<T>) => {
    setErrors(prev => ({ ...prev, ...fieldErrors }))
  }, [])

  const reset = useCallback((newValues?: T) => {
    const next = newValues ?? initialValuesRef.current
    initialValuesRef.current = next
    setValuesState(next)
    setErrors({})
    setTouched({})
    setIsDirty(false)
  }, [])

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault()
      }
      if (isSubmitting) return

      // Marcar todos como tocados
      const allTouched: Partial<Record<keyof T, boolean>> = {}
      for (const k of Object.keys(values) as (keyof T)[]) {
        allTouched[k] = true
      }
      setTouched(allTouched)

      let currentErrors: ValidationErrors<T> = {}
      if (validate) {
        currentErrors = await validate(values)
        setErrors(currentErrors)
      }

      const hasErrors = Object.values(currentErrors).some(Boolean)
      if (hasErrors) {
        // §6.5: Al enviar, enfocar el primer campo con error
        setTimeout(() => {
          const firstInvalid = document.querySelector<HTMLElement>(
            'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"], .field-invalid input, .field-invalid select, .field-invalid textarea'
          )
          firstInvalid?.focus()
        }, 10)
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
        setIsDirty(false)
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, onSubmit, validate, values]
  )

  return {
    values,
    setValues: setValuesState,
    setFieldValue,
    errors,
    setFieldError,
    setFieldsErrors,
    touched,
    isSubmitting,
    isDirty,
    handleBlur,
    handleSubmit,
    reset,
  }
}
