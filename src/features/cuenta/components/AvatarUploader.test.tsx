import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Avatar, getInitials, getDeterministicColor } from '../../../shared/components/avatar/Avatar'
import { AvatarUploader } from './AvatarUploader'

describe('Avatar', () => {
  it('calculates initials properly', () => {
    expect(getInitials('Jose Guevara')).toBe('JG')
    expect(getInitials('Admin')).toBe('AD')
    expect(getInitials('')).toBe('?')
    expect(getInitials(null)).toBe('?')
  })

  it('produces deterministic color', () => {
    const col1 = getDeterministicColor('user-123')
    const col2 = getDeterministicColor('user-123')
    expect(col1).toBe(col2)
    expect(col1.startsWith('#')).toBe(true)
  })

  it('renders image when src is valid, and falls back to initials on error', () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="Jose Guevara" />)
    const imgEl = screen.getByRole('img', { name: 'Jose Guevara' })
    expect(imgEl).toBeInTheDocument()

    // Trigger error on image
    fireEvent.error(imgEl)

    expect(screen.getByText('JG')).toBeInTheDocument()
  })
})

describe('AvatarUploader', () => {
  it('renders avatar and handles file selection validation', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const onDelete = vi.fn().mockResolvedValue(undefined)

    render(
      <AvatarUploader
        nombre="Jose Guevara"
        id="usr-1"
        onUpload={onUpload}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('JG')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Subir foto/ })).toBeInTheDocument()

    // Intentar subir archivo inválido (ej. archivo de texto)
    const file = new File(['dummy content'], 'document.txt', { type: 'text/plain' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByRole('alert')).toHaveTextContent(/Formato no soportado/)
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const onDelete = vi.fn().mockResolvedValue(undefined)

    render(
      <AvatarUploader
        fotoUrl="/api/v1/usuarios/usr-1/foto"
        nombre="Jose Guevara"
        id="usr-1"
        onUpload={onUpload}
        onDelete={onDelete}
      />
    )

    const deleteBtn = screen.getByRole('button', { name: /Eliminar/ })
    await user.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
