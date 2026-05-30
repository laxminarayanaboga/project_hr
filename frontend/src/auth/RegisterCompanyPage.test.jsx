import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import RegisterCompanyPage from './RegisterCompanyPage'

const mockRegister = vi.fn()
vi.mock('./useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  render(
    <MemoryRouter>
      <RegisterCompanyPage />
    </MemoryRouter>,
  )
}

describe('RegisterCompanyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /set up your company/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Acme Ltd')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/hr@yourcompany/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation error when company name is too short', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('Acme Ltd'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() =>
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument(),
    )
  })

  it('shows validation error when email is invalid', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('Acme Ltd'), { target: { value: 'Acme Ltd' } })
    fireEvent.change(screen.getByPlaceholderText(/hr@yourcompany/i), { target: { value: 'not-an-email' } })
    const [password, confirm] = screen.getAllByLabelText(/password/i)
    fireEvent.change(password, { target: { value: 'Password123!' } })
    fireEvent.change(confirm, { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(screen.getByText(/valid email/i)).toBeInTheDocument())
  })

  it('shows error when passwords do not match', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('Acme Ltd'), { target: { value: 'Acme Ltd' } })
    fireEvent.change(screen.getByPlaceholderText(/hr@yourcompany/i), { target: { value: 'hr@acme.com' } })
    const [password, confirm] = screen.getAllByLabelText(/password/i)
    fireEvent.change(password, { target: { value: 'Password123!' } })
    fireEvent.change(confirm, { target: { value: 'Different123!' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument(),
    )
  })

  it('calls register with correct payload on valid submit', async () => {
    mockRegister.mockResolvedValue({ role: 'HR_ADMIN' })
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Acme Ltd'), { target: { value: 'Acme Ltd' } })
    fireEvent.change(screen.getByPlaceholderText(/hr@yourcompany/i), { target: { value: 'hr@acme.com' } })
    const [password, confirm] = screen.getAllByLabelText(/password/i)
    fireEvent.change(password, { target: { value: 'Password123!' } })
    fireEvent.change(confirm, { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith({
        companyName: 'Acme Ltd',
        email: 'hr@acme.com',
        password: 'Password123!',
      }),
    )
  })

  it('redirects to dashboard on successful registration', async () => {
    mockRegister.mockResolvedValue({ role: 'HR_ADMIN' })
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Acme Ltd'), { target: { value: 'Acme Ltd' } })
    fireEvent.change(screen.getByPlaceholderText(/hr@yourcompany/i), { target: { value: 'hr@acme.com' } })
    const [password, confirm] = screen.getAllByLabelText(/password/i)
    fireEvent.change(password, { target: { value: 'Password123!' } })
    fireEvent.change(confirm, { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows error message when registration fails', async () => {
    mockRegister.mockRejectedValue({
      response: { data: { message: 'An account with this email already exists' } },
    })
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Acme Ltd'), { target: { value: 'Acme Ltd' } })
    fireEvent.change(screen.getByPlaceholderText(/hr@yourcompany/i), { target: { value: 'hr@acme.com' } })
    const [password, confirm] = screen.getAllByLabelText(/password/i)
    fireEvent.change(password, { target: { value: 'Password123!' } })
    fireEvent.change(confirm, { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(screen.getByText(/already exists/i)).toBeInTheDocument(),
    )
  })
})
