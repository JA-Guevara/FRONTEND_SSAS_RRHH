import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { asistenteApi } from '../api/asistenteApi'
import { Asistente } from './Asistente'

vi.mock('../api/asistenteApi', () => ({
  asistenteApi: {
    enviarMensaje: vi.fn(),
    ejecutarAccion: vi.fn(),
  },
}))

vi.mock('../api/chatbotApi', () => ({
  chatbotApi: {
    suggestions: vi.fn().mockResolvedValue(['¿Cómo ver postulaciones?']),
    ask: vi.fn(),
    article: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
})

test('Asistente opens and shows suggested questions and greetings', async () => {
  render(
    <MemoryRouter>
      <Asistente />
    </MemoryRouter>
  )

  const launcher = screen.getByRole('button', { name: 'Abrir asistente' })
  fireEvent.click(launcher)

  expect(screen.getByRole('dialog', { name: 'Asistente RRHH' })).toBeInTheDocument()
  expect(await screen.findByText('¿Cómo ver postulaciones?')).toBeInTheDocument()
})

test('Asistente renders confirmation card for write tool and allows execution', async () => {
  vi.mocked(asistenteApi.enviarMensaje).mockResolvedValue({
    tipo: 'accion',
    contenido: 'He preparado la siguiente acción de programar entrevista.',
    accion: {
      herramienta: 'programar_entrevista',
      titulo: 'Programar entrevista',
      descripcion: 'Programa una entrevista para un candidato.',
      argumentos: { postulacion_id: 'pos-1', fecha_hora: '2026-10-15T10:00:00Z' },
      resumen_confirmacion: {
        'Candidato': 'Mario Fernández',
        'Modalidad': 'Virtual',
      },
    },
  })

  vi.mocked(asistenteApi.ejecutarAccion).mockResolvedValue({
    exito: true,
    mensaje: 'Entrevista programada con éxito en Google Calendar',
  })

  render(
    <MemoryRouter>
      <Asistente />
    </MemoryRouter>
  )

  fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente' }))

  const input = screen.getByRole('textbox', { name: 'Pregunta para el asistente' })
  fireEvent.change(input, { target: { value: 'programá entrevista con Mario' } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pregunta' }))

  expect(await screen.findByText('⚡ Programar entrevista')).toBeInTheDocument()
  expect(screen.getByText('Mario Fernández')).toBeInTheDocument()
  expect(screen.getByText('Virtual')).toBeInTheDocument()

  // Confirmar acción
  const confirmBtn = screen.getByRole('button', { name: 'Confirmar y ejecutar' })
  fireEvent.click(confirmBtn)

  await waitFor(() => {
    expect(asistenteApi.ejecutarAccion).toHaveBeenCalledWith('programar_entrevista', {
      postulacion_id: 'pos-1',
      fecha_hora: '2026-10-15T10:00:00Z',
    })
  })

  expect(
    await screen.findByText('Acción confirmada y registrada en auditoría')
  ).toBeInTheDocument()
})

test('El robot del lanzador refleja el estado del asistente', async () => {
  vi.mocked(asistenteApi.enviarMensaje).mockRejectedValue(new Error('Servidor ocupado'))

  render(
    <MemoryRouter>
      <Asistente />
    </MemoryRouter>
  )

  expect(document.querySelector('.asistente-avatar--reposo')).not.toBeNull()
  expect(screen.getByRole('button', { name: 'Abrir asistente' })).toHaveClass(
    'asistente-launcher'
  )

  fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente' }))
  expect(
    screen.getByRole('button', { name: 'Ocultar asistente' })
  ).toHaveAttribute('aria-expanded', 'true')

  const input = screen.getByRole('textbox', { name: 'Pregunta para el asistente' })
  fireEvent.change(input, { target: { value: '¿Hay vacantes?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pregunta' }))

  expect(document.querySelector('.asistente-avatar--pensando')).not.toBeNull()

  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor ocupado')
  expect(document.querySelector('.asistente-avatar--alerta')).not.toBeNull()
})

async function montarEn(ruta: string) {
  window.history.pushState({}, '', ruta)
  vi.useFakeTimers()
  const vista = render(
    <MemoryRouter>
      <Asistente />
    </MemoryRouter>
  )
  await act(async () => {})
  return vista
}

function avanzar(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

test('Ofrece la sugerencia de la pantalla a los 3 segundos', async () => {
  await montarEn('/vacantes')

  expect(screen.queryByText('Puedo duplicar una vacante del mes pasado')).toBeNull()

  avanzar(3000)

  expect(screen.getByRole('status')).toHaveTextContent(
    'Puedo duplicar una vacante del mes pasado'
  )
  expect(screen.getByRole('button', { name: 'Abrir asistente' })).toHaveClass('llamando')
  expect(sessionStorage.getItem('ssas_asistente_pulso')).toBe('1')
})

test('La sugerencia cerrada no vuelve a aparecer en esa pantalla', async () => {
  const { unmount } = await montarEn('/reportes')
  avanzar(3000)

  expect(screen.getByText('Pedime un reporte hablando: «postulaciones de septiembre»')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sugerencia' }))
  expect(screen.queryByText(/Pedime un reporte hablando/)).toBeNull()
  expect(screen.getByRole('button', { name: 'Abrir asistente' })).not.toHaveClass(
    'llamando'
  )

  unmount()
  await montarEn('/reportes')
  avanzar(3000)

  expect(screen.queryByText(/Pedime un reporte hablando/)).toBeNull()
})

test('No muestra la sugerencia si el usuario ya interactuó', async () => {
  await montarEn('/seleccion')

  fireEvent.pointerDown(document.body)
  avanzar(3000)

  expect(screen.queryByText('¿Querés que analice los CV pendientes?')).toBeNull()
})

test('No muestra globo en pantallas sin sugerencia', async () => {
  await montarEn('/empleados')

  avanzar(3000)

  expect(document.querySelector('.asistente-hint')).toBeNull()
})
