import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SelectorTema } from './SelectorTema'

describe('SelectorTema', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('muestra las tres opciones y cuál está activa sin tener que pulsarla', () => {
    localStorage.setItem('ssas:tema', 'light')
    render(<SelectorTema />)
    expect(screen.getByRole('radiogroup', { name: 'Tema' })).toBeInTheDocument()
    const opciones = screen.getAllByRole('radio')
    expect(opciones.map((o) => o.textContent)).toEqual(['Claro', 'Oscuro', 'Auto'])
    expect(opciones[0]).toHaveAttribute('aria-checked', 'true')
    expect(opciones[1]).toHaveAttribute('aria-checked', 'false')
    expect(opciones[2]).toHaveAttribute('aria-checked', 'false')
  })

  it('sin preferencia guardada deja Auto como opción activa', () => {
    render(<SelectorTema />)
    const opciones = screen.getAllByRole('radio')
    expect(opciones[2]).toHaveAttribute('aria-checked', 'true')
    expect(opciones[0]).toHaveAttribute('aria-checked', 'false')
    expect(opciones[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('aplica el tema elegido, lo marca activo y lo recuerda', () => {
    render(<SelectorTema />)
    fireEvent.click(screen.getByRole('radio', { name: 'Oscuro' }))
    expect(screen.getByRole('radio', { name: 'Oscuro' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Claro' })).toHaveAttribute('aria-checked', 'false')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('ssas:tema')).toBe('dark')
  })

  it('Auto deja que el sistema operativo decida el tema', () => {
    render(<SelectorTema />)
    fireEvent.click(screen.getByRole('radio', { name: 'Oscuro' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Auto' }))
    expect(screen.getByRole('radio', { name: 'Auto' })).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
