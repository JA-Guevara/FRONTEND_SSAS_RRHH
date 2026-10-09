import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Cierra un desplegable al hacer clic fuera o al pulsar Escape, y devuelve el foco al disparador.
 *
 * Comportamiento:
 * 1. `pointerdown` fuera del contenedor cierra.
 * 2. `Escape` cierra **y devuelve el foco al botón que lo abrió**.
 * 3. Mover el foco fuera del contenedor (Tab) cierra.
 * 4. Al abrir, enfoca el primer elemento del menú.
 * 5. Al cerrar, limpia los escuchas.
 *
 * El disparador queda excluido: su propio clic alterna el menú y no debe
 * cerrarlo para inmediatamente reabrirlo.
 *
 * Se usa en: menú de cuenta, selector de empresa, filtros de columna, menú de exportación.
 */
export function useCerrarAlClicFuera<T extends HTMLElement>(
  abierto: boolean,
  cerrar: () => void,
): { ref: RefObject<T | null>; refDisparador: RefObject<HTMLButtonElement | null> } {
  const ref = useRef<T | null>(null)
  const refDisparador = useRef<HTMLButtonElement | null>(null)
  const cerrarRef = useRef(cerrar)
  cerrarRef.current = cerrar

  useEffect(() => {
    if (!abierto) return
    if (ref.current === null) return
    const contenedor: T = ref.current

    function esFuera(target: EventTarget | null): boolean {
      if (!(target instanceof Node)) return false
      if (contenedor.contains(target)) return false
      const disparador = refDisparador.current
      if (disparador !== null && disparador.contains(target)) return false
      return true
    }

    function handlePointerDown(event: PointerEvent) {
      if (esFuera(event.target)) cerrarRef.current()
    }

    function handleFocusIn(event: FocusEvent) {
      if (esFuera(event.target)) cerrarRef.current()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      cerrarRef.current()
      refDisparador.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('keydown', handleKeyDown)

    // 4. Al abrir, enfoca el primer elemento del menú
    contenedor.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [abierto])

  return { ref, refDisparador }
}
