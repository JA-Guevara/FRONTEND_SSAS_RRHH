import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { VacantesPublicasList } from './VacantesPublicasList'

afterEach(cleanup)

const mockVacantes: any[] = [
  {
    id: 'vp-1',
    empresa_nombre: 'Empresa Demo',
    titulo: 'Diseñador UI/UX',
    modalidad: 'REMOTO',
    ubicacion: 'Cochabamba',
    fecha_publicacion: '2026-10-01T00:00:00Z',
    fecha_cierre: '2026-11-15T00:00:00Z',
    mostrar_salario: true,
    salario_min: '8000',
    salario_max: '12000',
    descripcion: 'Diseño de experiencias',
    requisitos: 'Figma, CSS',
    beneficios: 'Seguro médico',
    cantidad_vacantes: 1,
    experiencia_min: 2,
    departamento_nombre: 'Diseño',
    habilidades: [],
  },
]

it('renders public job list with location, modality and formatted salary', () => {
  render(
    <MemoryRouter>
      <VacantesPublicasList
        vacantes={mockVacantes}
        basePath="/empleos/empresa-demo"
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: 'Diseñador UI/UX' })).toBeInTheDocument()
  expect(screen.getByText('Cochabamba')).toBeInTheDocument()
  expect(screen.getByText('Remoto')).toBeInTheDocument()
  expect(screen.getByText(/Salario.*8\.000.*12\.000/i)).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/empleos/empresa-demo/vacantes/vp-1')
})

it('shows empty state when no job vacancies are published', () => {
  render(
    <MemoryRouter>
      <VacantesPublicasList
        vacantes={[]}
        basePath="/empleos/empresa-demo"
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    </MemoryRouter>,
  )

  expect(screen.getByText('Sin vacantes por ahora')).toBeInTheDocument()
})

it('displays error and triggers onRetry when retry button is clicked', async () => {
  const user = userEvent.setup()
  const onRetry = vi.fn()

  render(
    <MemoryRouter>
      <VacantesPublicasList
        vacantes={[]}
        basePath="/empleos/empresa-demo"
        loading={false}
        error="Fallo de red"
        onRetry={onRetry}
      />
    </MemoryRouter>,
  )

  expect(screen.getByText(/No pudimos cargar las vacantes/i)).toBeInTheDocument()
  expect(screen.getByText('Fallo de red')).toBeInTheDocument()

  const retryBtn = screen.getByRole('button', { name: /Reintentar/i })
  await user.click(retryBtn)
  expect(onRetry).toHaveBeenCalled()
})
