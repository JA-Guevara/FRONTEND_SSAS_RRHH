import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
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
