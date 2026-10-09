import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { AsistenteAvatar } from './AsistenteAvatar'

test('Dibuja el robot con cabeza, dos ojos y antena', () => {
  const { container } = render(<AsistenteAvatar estado="reposo" />)

  const svg = container.querySelector('svg')
  expect(svg).not.toBeNull()
  expect(svg?.classList.contains('asistente-avatar')).toBe(true)
  expect(svg?.classList.contains('asistente-avatar--reposo')).toBe(true)
  expect(container.querySelector('.av-cabeza')).toBeInTheDocument()
  expect(container.querySelectorAll('.av-ojo')).toHaveLength(2)
  expect(container.querySelector('.av-antena')).toBeInTheDocument()
  expect(container.querySelector('.av-antena-punto')).toBeInTheDocument()
  expect(svg?.getAttribute('aria-hidden')).toBe('true')
})

test('Usa 28 px por defecto y el tamaño indicado cuando se pide', () => {
  const { container, rerender } = render(<AsistenteAvatar estado="reposo" />)
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('28')

  rerender(<AsistenteAvatar estado="reposo" tamano={36} />)
  const svg = container.querySelector('svg')
  expect(svg?.getAttribute('width')).toBe('36')
  expect(svg?.getAttribute('height')).toBe('36')
})

test('Cambia la clase del SVG para los cinco estados', () => {
  const estados = ['reposo', 'escuchando', 'pensando', 'listo', 'alerta'] as const
  const { container, rerender } = render(<AsistenteAvatar estado="reposo" />)

  for (const estado of estados) {
    rerender(<AsistenteAvatar estado={estado} />)
    const svg = container.querySelector('svg')
    expect(svg?.classList.contains(`asistente-avatar--${estado}`)).toBe(true)
    expect(svg?.classList.contains('asistente-avatar')).toBe(true)
  }
})

test('Pinta solo el elemento propio de cada estado', () => {
  const { container, rerender } = render(<AsistenteAvatar estado="reposo" />)
  expect(container.querySelector('.av-alerta')).toBeInTheDocument()

  rerender(<AsistenteAvatar estado="alerta" />)
  expect(container.querySelector('.av-alerta')).toBeInTheDocument()

  rerender(<AsistenteAvatar estado="pensando" />)
  expect(container.querySelectorAll('.av-punto')).toHaveLength(3)
  expect(container.querySelectorAll('.av-onda')).toHaveLength(3)
})
