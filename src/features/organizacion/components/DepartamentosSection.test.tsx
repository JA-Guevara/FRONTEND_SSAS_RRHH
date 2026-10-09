import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DepartamentosSection } from './DepartamentosSection'

afterEach(cleanup)

const mockDepartamentos: any[] = [
  {
    id: 'dep-1',
    empresa_id: 'empresa-org',
    nombre: 'Tecnología e Innovación',
    codigo: 'TI-001',
    descripcion: 'Área de desarrollo y soporte',
    padre_id: null,
    departamento_padre_id: null,
    activo: true,
  },
  {
    id: 'dep-2',
    empresa_id: 'empresa-org',
    nombre: 'Recursos Humanos',
    codigo: 'RH-002',
    descripcion: 'Gestión del talento',
    padre_id: null,
    departamento_padre_id: null,
    activo: false,
  },
]

it('renders departments table with status badges and codes', () => {
  render(
    <DepartamentosSection
      departamentos={mockDepartamentos}
      empresaId="empresa-org"
      loading={false}
      error={null}
      onReload={vi.fn()}
    />,
  )

  expect(screen.getByText('Tecnología e Innovación')).toBeInTheDocument()
  expect(screen.getByText('TI-001')).toBeInTheDocument()
  expect(screen.getByText('Recursos Humanos')).toBeInTheDocument()
  expect(screen.getByText('Activo')).toBeInTheDocument()
  expect(screen.getByText('Inactivo')).toBeInTheDocument()
})

it('opens department create modal when clicking Nuevo departamento button', async () => {
  const user = userEvent.setup()
  render(
    <DepartamentosSection
      departamentos={mockDepartamentos}
      empresaId="empresa-org"
      loading={false}
      error={null}
      onReload={vi.fn()}
    />,
  )

  const newBtn = screen.getByRole('button', { name: /Nuevo departamento/i })
  await user.click(newBtn)

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByLabelText(/^Nombre/i)).toBeInTheDocument()
})
