import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { VacantesListPage } from './VacantesListPage'
import * as vacantesApi from '../api/vacantesApi'

vi.mock('../../../app/context/CompanyScopeContext', () => ({
  useCompanyScope: () => ({
    company: { id: 'empresa-v', nombre_comercial: 'Empresa Vacantes' },
  }),
}))

vi.mock('../../../app/access/AccessProvider', () => ({
  useAccess: () => ({ can: () => true }),
  Can: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('../api/vacantesApi', () => ({
  getVacantes: vi.fn(),
  publicarVacante: vi.fn(),
  pausarVacante: vi.fn(),
  reanudarVacante: vi.fn(),
  cerrarVacante: vi.fn(),
  eliminarVacante: vi.fn(),
}))

const mockResponse: vacantesApi.PaginatedVacantes = {
  items: [
    {
      id: 'v-1',
      titulo: 'Ingeniero de Software Senior',
      cargo_id: 'c-1',
      departamento_id: 'dep-1',
      descripcion: 'Desc',
      requisitos: 'Req',
      beneficios: 'Ben',
      experiencia_min: 3,
      fecha_cierre: '2026-12-31',
      cargo_nombre: 'Ingeniero de Software',
      departamento_nombre: 'Tecnología',
      estado: 'PUBLICADA',
      modalidad: 'HIBRIDO',
      ubicacion: 'Santa Cruz',
      cantidad_vacantes: 1,
      postulantes_count: 5,
      mostrar_salario: true,
      salario_min: 10000,
      salario_max: 15000,
    },
  ],
  departamentos: [{ id: 'dep-1', nombre: 'Tecnología' }],
  total: 1,
  all_total: 1,
  counts: { BORRADOR: 0, PUBLICADA: 1, PAUSADA: 0, CERRADA: 0, CANCELADA: 0 },
  page: 1,
  per_page: 10,
  total_pages: 1,
}

beforeEach(() => {
  vi.mocked(vacantesApi.getVacantes).mockReset().mockResolvedValue(mockResponse)
})

afterEach(cleanup)

function renderVacantes() {
  render(
    <MemoryRouter>
      <VacantesListPage />
    </MemoryRouter>,
  )
}

it('renders vacancy list, metrics summary cards, and salary ranges', async () => {
  renderVacantes()

  await waitFor(() => {
    expect(screen.getByText('Ingeniero de Software Senior')).toBeInTheDocument()
  })

  expect(screen.getAllByText('Tecnología').length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText(/Total de vacantes/i)).toBeInTheDocument()
  expect(screen.getByText(/Publicadas/i)).toBeInTheDocument()
  expect(screen.getByText(/Bs\. 10.000 – 15.000/i)).toBeInTheDocument()
})

it('triggers filter search on input typing', async () => {
  const user = userEvent.setup()
  renderVacantes()

  await waitFor(() => {
    expect(screen.getByText('Ingeniero de Software Senior')).toBeInTheDocument()
  })

  const searchInput = screen.getByLabelText(/Buscar vacante/i)
  await user.type(searchInput, 'Arquitecto')

  await waitFor(() => {
    expect(vacantesApi.getVacantes).toHaveBeenCalledWith(
      expect.objectContaining({ busqueda: 'Arquitecto' }),
    )
  })
})
