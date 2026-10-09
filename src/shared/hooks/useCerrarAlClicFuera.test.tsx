import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { useCerrarAlClicFuera } from './useCerrarAlClicFuera'

type DemoProps = { onCerrar?: () => void }

function Demo({ onCerrar }: DemoProps) {
  const [abierto, setAbierto] = useState(false)
  const { ref, refDisparador } = useCerrarAlClicFuera<HTMLDivElement>(abierto, () => {
    setAbierto(false)
    onCerrar?.()
  })

  return (
    <div>
      <button type="button" ref={refDisparador} onClick={() => setAbierto((o) => !o)}>
        Abrir menú
      </button>
      {abierto && (
        <div ref={ref} role="menu">
          <button type="button">Primer elemento</button>
          <button type="button">Segundo elemento</button>
        </div>
      )}
      <button type="button">Fuera del menú</button>
    </div>
  )
}

function abrir(onCerrar?: () => void) {
  const utils = render(<Demo onCerrar={onCerrar} />)
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
  return utils
}

describe('useCerrarAlClicFuera', () => {
  it('al abrir enfoca el primer elemento del menú', () => {
    abrir()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primer elemento' }))
  })

  it('cierra al pulsar fuera del contenedor', () => {
    const onCerrar = vi.fn()
    abrir(onCerrar)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Fuera del menú' }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('el disparador no cierra el menú por su cuenta', () => {
    const onCerrar = vi.fn()
    abrir(onCerrar)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(onCerrar).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('Escape cierra y devuelve el foco al disparador', () => {
    const onCerrar = vi.fn()
    abrir(onCerrar)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCerrar).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Abrir menú' }))
  })

  it('cierra cuando el foco sale del contenedor con Tab', () => {
    const onCerrar = vi.fn()
    abrir(onCerrar)
    fireEvent.focusIn(screen.getByRole('button', { name: 'Fuera del menú' }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('al cerrar limpia los escuchas', () => {
    const onCerrar = vi.fn()
    abrir(onCerrar)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCerrar).toHaveBeenCalledTimes(1)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Fuera del menú' }))
    fireEvent.focusIn(screen.getByRole('button', { name: 'Fuera del menú' }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })
})
