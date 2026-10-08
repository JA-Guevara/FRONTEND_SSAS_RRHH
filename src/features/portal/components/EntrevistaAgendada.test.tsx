import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  confirmarEntrevista,
  consultarEntrevista,
  PortalApiError,
  type EntrevistaPublica,
} from '../api/portalApi'
import { EntrevistaAgendada } from './EntrevistaAgendada'

vi.mock('../api/portalApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/portalApi')>()
  return {
    ...actual,
    consultarEntrevista: vi.fn(),
    confirmarEntrevista: vi.fn(),
  }
})

const entrevistaProgramada: EntrevistaPublica = {
  id: 'entrevista-1',
  fecha_hora: '2026-11-15T14:00:00Z',
  duracion_min: 45,
  modalidad: 'VIRTUAL',
  enlace_reunion: 'https://meet.google.com/abc-defg-hij',
  lugar: null,
  estado: 'PROGRAMADA',
}

const entrevistaConfirmada: EntrevistaPublica = {
  ...entrevistaProgramada,
  estado: 'CONFIRMADA',
}

beforeEach(() => {
  vi.mocked(consultarEntrevista).mockReset()
  vi.mocked(confirmarEntrevista).mockReset()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('EntrevistaAgendada', () => {
  it('no muestra nada si la API retorna 404 (no hay entrevista agendada)', async () => {
    vi.mocked(consultarEntrevista).mockRejectedValue(
      new PortalApiError('No encontrada', 404)
    )

    const { container } = render(<EntrevistaAgendada codigo="COD-404" />)

    await waitFor(() => {
      expect(consultarEntrevista).toHaveBeenCalledWith('COD-404')
    })

    expect(container.firstChild).toBeNull()
  })

  it('muestra detalles y botón de confirmación cuando el estado es PROGRAMADA', async () => {
    vi.mocked(consultarEntrevista).mockResolvedValue(entrevistaProgramada)

    render(<EntrevistaAgendada codigo="COD-PROG" />)

    expect(await screen.findByRole('region', { name: 'Entrevista agendada' })).toBeInTheDocument()
    expect(screen.getByText('45 minutos')).toBeInTheDocument()
    expect(screen.getByText('VIRTUAL')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Unirse a la reunión' })).toHaveAttribute(
      'href',
      'https://meet.google.com/abc-defg-hij'
    )
    expect(screen.getByRole('button', { name: 'Confirmar asistencia' })).toBeInTheDocument()
  })

  it('llama a confirmarEntrevista al hacer click y actualiza a CONFIRMADA', async () => {
    vi.mocked(consultarEntrevista).mockResolvedValue(entrevistaProgramada)
    vi.mocked(confirmarEntrevista).mockResolvedValue(entrevistaConfirmada)

    render(<EntrevistaAgendada codigo="COD-PROG" />)

    const btn = await screen.findByRole('button', { name: 'Confirmar asistencia' })
    const user = userEvent.setup()
    await user.click(btn)

    expect(confirmarEntrevista).toHaveBeenCalledWith('COD-PROG')
    expect(
      await screen.findByText('Confirmaste tu asistencia a la entrevista.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar asistencia' })).not.toBeInTheDocument()
  })

  it('muestra estado CONFIRMADA sin botón si ya estaba confirmada', async () => {
    vi.mocked(consultarEntrevista).mockResolvedValue(entrevistaConfirmada)

    render(<EntrevistaAgendada codigo="COD-CONF" />)

    expect(await screen.findByRole('region', { name: 'Entrevista agendada' })).toBeInTheDocument()
    expect(screen.getByText('CONFIRMADA')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar asistencia' })).not.toBeInTheDocument()
    expect(screen.getByText('Confirmaste tu asistencia a la entrevista.')).toBeInTheDocument()
  })

  it('muestra alerta de error si falla la confirmación', async () => {
    vi.mocked(consultarEntrevista).mockResolvedValue(entrevistaProgramada)
    vi.mocked(confirmarEntrevista).mockRejectedValue(
      new Error('No se pudo confirmar por problemas de red')
    )

    render(<EntrevistaAgendada codigo="COD-FAIL" />)

    const btn = await screen.findByRole('button', { name: 'Confirmar asistencia' })
    const user = userEvent.setup()
    await user.click(btn)

    expect(
      await screen.findByText('No se pudo confirmar por problemas de red')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar asistencia' })).toBeInTheDocument()
  })
})
