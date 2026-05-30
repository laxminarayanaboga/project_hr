import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ResetPasswordPage from './ResetPasswordPage'

const mockResetPassword = vi.fn()
vi.mock('../api/authApi', () => ({
  authApi: { resetPassword: (...args) => mockResetPassword(...args) },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderWithToken(token) {
  const path = token ? `/reset-password?token=${token}` : '/reset-password'
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows invalid link message when no token in URL', () => {
    renderWithToken(null)
    expect(screen.getByText(/invalid link/i)).toBeInTheDocument()
  })

  it('renders password fields when token is present', () => {
    renderWithToken('valid-token')
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('shows validation error when password is too short', async () => {
    renderWithToken('valid-token')
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument())
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    renderWithToken('valid-token')
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Different1!' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => expect(screen.getByText(/do not match/i)).toBeInTheDocument())
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('calls resetPassword with token and password on valid submit', async () => {
    mockResetPassword.mockResolvedValue({})
    renderWithToken('my-token')
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'NewPass1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'NewPass1!' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() =>
      expect(mockResetPassword).toHaveBeenCalledWith({ token: 'my-token', password: 'NewPass1!' }),
    )
  })

  it('navigates to login with success param after reset', async () => {
    mockResetPassword.mockResolvedValue({})
    renderWithToken('my-token')
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'NewPass1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'NewPass1!' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login?reset=success'))
  })

  it('shows error message when reset token is invalid', async () => {
    mockResetPassword.mockRejectedValue(new Error('Invalid token'))
    renderWithToken('bad-token')
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'NewPass1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'NewPass1!' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument())
  })
})
