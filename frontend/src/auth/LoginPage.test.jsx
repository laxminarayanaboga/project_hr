import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from './LoginPage'

// Mock useAuth so we control login behaviour
const mockLogin = vi.fn()
vi.mock('./useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLogin() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/you@company/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when email is invalid', async () => {
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/valid email/i)).toBeInTheDocument())
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue({ role: 'HR_ADMIN' })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'hr@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Pass123!' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('hr@test.com', 'Pass123!'))
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Bad credentials'))
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'hr@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument())
  })

  it('navigates to dashboard on successful login', async () => {
    mockLogin.mockResolvedValue({ role: 'HR_ADMIN' })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/you@company/i), { target: { value: 'hr@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Pass123!' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })
})
