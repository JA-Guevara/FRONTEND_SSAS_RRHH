import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TableroPage } from './TableroPage'
import * as tableroApi from '../api/tableroApi'
import * as vacantesApi from '../../vacantes/api/vacantesApi'

vi.mock('../../../app/context/CompanyScopeContext', () => ({
  useCompanyScope: () => ({
    company: { id: 'empresa-test', nombre_comercial: 'Empresa Test' },
    selectedCompanyId: 'empresa-test',
  }),
}))

vi.mock('../../../app/access/AccessProvider', () => ({
  useAccess: () => ({ can: () => true }),
  Can: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('../api/tableroApi', () => ({
  getEtapas: vi.fn(),
  getPostulaciones: vi.fn(),
  moverPostulacion: vi.fn(),
}))

vi.mock('../../vacantes/api/vacantesApi', () => ({
  getVacante: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(vacantesApi.getVacante).mockReset().mockResolvedValue({
    id: 'vac-1',
    titulo: 'Desarrollador Full Stack',
    estado: 'PUBLICADA',
    cantidad_vacantes: 2,
    modalidad: 'REMOTO',
  } as never)

  vi.mocked(tableroApi.getEtapas).mockReset().mockResolvedValue([
    { id: 'et-1', nombre: 'Postulado', orden: 1 },
    { id: 'et-2', nombre: 'Entrevista', orden: 2 },
  ] as never)

  vi.mocked(tableroApi.getPostulaciones).mockReset().mockResolvedValue([
    {
      id: 'post-1',
      etapa_id: 'et-1',
      nombre_postulante: 'Carlos Méndez',
      email: 'carlos@example.com',
      estado: 'POSTULADO',
      fecha_postulacion: '2026-10-01T10:00:00Z',
      ciudad: 'Santa Cruz',
      puntaje_ia: 85,
      puntaje_manual: null,
    },
  ] as never)
})

afterEach(cleanup)

function renderTablero(vacanteId = 'vac-1') {
  render(
    <MemoryRouter initialEntries={[`/vacantes/${vacanteId}/tablero`]}>
      <Routes>
        <Route path="/vacantes/:id/tablero" element={<TableroPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

it('loads vacancy data, stages, and renders candidates across columns', async () => {
  renderTablero('vac-1')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /Tablero: Desarrollador Full Stack/i })).toBeInTheDocument()
  })

  expect(screen.getByText('Postulado')).toBeInTheDocument()
  expect(screen.getByText('Entrevista')).toBeInTheDocument()
  expect(screen.getByText('Carlos Méndez')).toBeInTheDocument()
  expect(screen.getByText('85%')).toBeInTheDocument()
})

it('shows empty state when no stages are configured for company', async () => {
  vi.mocked(tableroApi.getEtapas).mockResolvedValue([])
  vi.mocked(tableroApi.getPostulaciones).mockResolvedValue([])

  renderTablero('vac-1')

  await waitFor(() => {
    expect(screen.getByText('Sin etapas de reclutamiento')).toBeInTheDocument()
  })
})
