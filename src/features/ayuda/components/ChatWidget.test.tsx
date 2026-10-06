import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { chatbotApi } from '../api/chatbotApi'
import { ChatWidget } from './ChatWidget'

vi.mock('../api/chatbotApi', () => ({ chatbotApi: { suggestions: vi.fn(), ask: vi.fn(), article: vi.fn() } }))

beforeEach(() => {
  vi.mocked(chatbotApi.suggestions).mockResolvedValue(['Vacaciones'])
  vi.mocked(chatbotApi.ask).mockResolvedValue({ respuesta: 'Consulta la política.', fuentes: [{ id: 'a', titulo: 'Política' }], sin_respuesta: false })
  vi.mocked(chatbotApi.article).mockResolvedValue({ id: 'a', titulo: 'Política', contenido: 'Texto aprobado', categoria: 'General', publico: true, publicado: true, actualizado_en: '' })
})

test('opens, asks the public API and shows the source', async () => {
  render(<ChatWidget slug="2222" />)
  fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Pregunta para el asistente' }), { target: { value: '¿Cómo pido vacaciones?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pregunta' }))
  await waitFor(() => expect(chatbotApi.ask).toHaveBeenCalledWith('¿Cómo pido vacaciones?', '2222'))
  expect(await screen.findByText('Consulta la política.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Política' }))
  expect(await screen.findByText('Texto aprobado')).toBeInTheDocument()
})
