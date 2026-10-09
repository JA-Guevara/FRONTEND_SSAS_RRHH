import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CargosSection } from './CargosSection'

afterEach(cleanup)

const mockDepartamentos: any[] = [
  { id: 'dep-1', empresa_id: 'empresa-org', nombre: 'Tecnología', codigo: 'TI', descripcion: '', padre_id: null, activo: true },
]

const mockCargos: any[] = [
  {
    id: 'car-1',
    empresa_id: 'empresa-org',
    nombre: 'Líder Técnico',
    codigo: 'TL-01',
    departamento_id: 'dep-1',
    departamento_nombre: 'Tecnología',
    descripcion: 'Liderazgo técnico de proyectos',
    nivel: 'LEAD',
    salario_min: 15000,
    salario_max: 22000,
    activo: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
]

it('renders cargos table with level, department, and salary range', () => {
  render(
    <CargosSection
      cargos={mockCargos}
      departamentos={mockDepartamentos}
      empresaId="empresa-org"
      loading={false}
      error={null}
      onReload={vi.fn()}
    />,
  )

  expect(screen.getByText('Líder Técnico')).toBeInTheDocument()
  expect(screen.getByText('Lead / Jefe')).toBeInTheDocument()
  expect(screen.getByText('Tecnología')).toBeInTheDocument()
  expect(screen.getByText(/Bs\.\s*15000\s*-\s*22000/i)).toBeInTheDocument()
})

it('opens cargo create modal with department selector', async () => {
  const user = userEvent.setup()
  render(
    <CargosSection
      cargos={mockCargos}
      departamentos={mockDepartamentos}
      empresaId="empresa-org"
      loading={false}
      error={null}
      onReload={vi.fn()}
    />,
  )

  const newBtn = screen.getByRole('button', { name: /Nuevo cargo/i })
  await user.click(newBtn)

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByLabelText(/Nombre del cargo/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Departamento/i)).toBeInTheDocument()
})
