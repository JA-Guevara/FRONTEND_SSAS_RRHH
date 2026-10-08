import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  Card,
  Stat,
  Toolbar,
  Tabs,
  Skeleton,
  Select,
  Drawer,
  Breadcrumb,
  FormRow,
  DescriptionList,
} from './index'

describe('Visual Primitives', () => {
  it('Card renders title, subtitle and body', () => {
    render(
      <Card title="Card Title" subtitle="Subtitle">
        <p>Card content</p>
      </Card>
    )
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('Stat renders label and value', () => {
    render(<Stat label="Usuarios" value="128" />)
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
    expect(screen.getByText('128')).toBeInTheDocument()
  })

  it('Toolbar renders children with toolbar semantics', () => {
    render(
      <Toolbar>
        <button type="button">Buscar</button>
      </Toolbar>
    )
    expect(screen.getByRole('region', { name: 'Controles de búsqueda y filtros' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })

  it('Tabs responds to tab selection', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Tabs
        items={[
          { id: 'tab1', label: 'General' },
          { id: 'tab2', label: 'Avanzado' },
        ]}
        active="tab1"
        onChange={handleChange}
      />
    )
    const tab2 = screen.getByRole('tab', { name: 'Avanzado' })
    await user.click(tab2)
    expect(handleChange).toHaveBeenCalledWith('tab2')
  })

  it('Skeleton renders variants without crashing', () => {
    const { container } = render(<Skeleton rows={4} variant="text" />)
    expect(container.querySelectorAll('.skeleton-text').length).toBe(4)
  })

  it('Select renders options and triggers change', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        label="País"
        options={[
          { value: 'BO', label: 'Bolivia' },
          { value: 'AR', label: 'Argentina' },
        ]}
        value="BO"
        onChange={handleChange}
      />
    )
    const select = screen.getByLabelText(/País/)
    await user.selectOptions(select, 'AR')
    expect(handleChange).toHaveBeenCalledWith('AR')
  })

  it('Drawer handles open and close on escape or click', async () => {
    const handleClose = vi.fn()
    render(
      <Drawer open={true} onClose={handleClose} title="Panel Lateral">
        <p>Drawer content</p>
      </Drawer>
    )
    expect(screen.getByText('Panel Lateral')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: 'Cerrar panel' })
    const user = userEvent.setup()
    await user.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it('Breadcrumb renders links and current item', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          items={[
            { label: 'Inicio', to: '/' },
            { label: 'Empresas', to: '/empresas' },
            { label: 'Detalle' },
          ]}
        />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Detalle')).toHaveAttribute('aria-current', 'page')
  })

  it('FormRow renders label and validation errors', () => {
    render(
      <FormRow label="Correo" error="Correo inválido" required>
        <input type="text" />
      </FormRow>
    )
    expect(screen.getByText('Correo')).toBeInTheDocument()
    expect(screen.getByText('Correo inválido')).toBeInTheDocument()
  })

  it('DescriptionList renders pairs', () => {
    render(
      <DescriptionList
        items={[
          { label: 'Cargo', value: 'Desarrollador' },
          { label: 'Salario', value: 'Bs 10.000' },
        ]}
      />
    )
    expect(screen.getByText('Cargo')).toBeInTheDocument()
    expect(screen.getByText('Desarrollador')).toBeInTheDocument()
  })
})
