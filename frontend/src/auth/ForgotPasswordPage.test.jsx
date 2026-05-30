import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ForgotPasswordPage from './ForgotPasswordPage'

const mockForgotPassword = vi.fn()
vi.mock('../api/authApi', () => ({
  authApi: { forgotPassword: (...args) => mockForgotPassword(...args) },
}))

function renderPage() {
  render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>,
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input and submit button', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/you@company/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('shows validation error when email is invalid', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => expect(screen.getByText(/valid email/i)).toBeInTheDocument())
    expect(mockForgotPassword).not.toHaveBeenCalled()
  })

  it('calls forgotPassword with email on valid submit', async () => {
    mockForgotPassword.mockResolvedValue({})
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'hr@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => expect(mockForgotPassword).toHaveBeenCalledWith('hr@test.com'))
  })

  it('shows confirmation message after successful submission', async () => {
    mockForgotPassword.mockResolvedValue({})
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'hr@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument())
  })

  it('shows error message on API failure', async () => {
    mockForgotPassword.mockRejectedValue(new Error('Server error'))
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'hr@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument())
  })
})
