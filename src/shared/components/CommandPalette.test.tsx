import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CommandPalette } from './CommandPalette'

vi.mock('../../app/access/AccessProvider', () => ({
  useAccess: () => ({
    can: () => true,
    hasModulo: () => true,
  }),
  Can: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Test User', realm: 'tenant', roles: ['Admin'] },
  }),
}))

vi.mock('../../app/context/CompanyScopeContext', () => ({
  useCompanyScope: () => ({
    company: { id: 'emp-1', nombre_comercial: 'Empresa Test' },
  }),
}))

afterEach(cleanup)

it('renders command palette when open and filters destinations on query typing', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()

  render(
    <MemoryRouter>
      <CommandPalette open={true} onClose={onClose} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Buscar destino o ejecutar acción/i)).toBeInTheDocument()

  const input = screen.getByPlaceholderText(/Buscar destino o ejecutar acción/i)
  await user.type(input, 'Vacantes')

  expect(screen.getByText('Vacantes')).toBeInTheDocument()
})

it('calls onClose when Escape key is pressed', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()

  render(
    <MemoryRouter>
      <CommandPalette open={true} onClose={onClose} />
    </MemoryRouter>,
  )

  await user.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalled()
})
