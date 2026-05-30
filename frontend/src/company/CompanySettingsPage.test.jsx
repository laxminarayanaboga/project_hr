import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CompanySettingsPage from './CompanySettingsPage'

const mockGetProfile = vi.fn()
const mockUpdateProfile = vi.fn()
const mockUploadLogo = vi.fn()

vi.mock('../api/companyApi', () => ({
  companyApi: {
    getProfile: () => mockGetProfile(),
    updateProfile: (data) => mockUpdateProfile(data),
    uploadLogo: (file) => mockUploadLogo(file),
  },
}))

const mockUser = { role: 'HR_ADMIN', email: 'hr@acme.com' }
vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

const stubProfile = {
  id: '123',
  name: 'Acme Corp',
  slug: 'acme-corp',
  email: 'hr@acme.com',
  phone: '+44 20 7946 0958',
  address: '123 London Road',
  country: 'United Kingdom',
  logoUrl: null,
}

function renderPage(role = 'HR_ADMIN') {
  mockUser.role = role
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CompanySettingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CompanySettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProfile.mockResolvedValue({ data: { data: stubProfile } })
  })

  it('renders company name in the editable form for HR_ADMIN', async () => {
    renderPage('HR_ADMIN')
    await waitFor(() =>
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('renders read-only view for MANAGER', async () => {
    renderPage('MANAGER')
    await waitFor(() =>
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    )
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  })

  it('renders read-only view for EMPLOYEE', async () => {
    renderPage('EMPLOYEE')
    await waitFor(() =>
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    )
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  })

  it('calls updateProfile on save', async () => {
    mockUpdateProfile.mockResolvedValue({ data: { data: { ...stubProfile, name: 'New Name' } } })
    renderPage('HR_ADMIN')

    await waitFor(() => screen.getByDisplayValue('Acme Corp'))

    fireEvent.change(screen.getByDisplayValue('Acme Corp'), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }))
    )
  })

  it('shows validation error when name is cleared', async () => {
    renderPage('HR_ADMIN')
    await waitFor(() => screen.getByDisplayValue('Acme Corp'))

    fireEvent.change(screen.getByDisplayValue('Acme Corp'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    )
  })

  it('shows upload logo button for HR_ADMIN', async () => {
    renderPage('HR_ADMIN')
    await waitFor(() => screen.getByDisplayValue('Acme Corp'))
    expect(screen.getByRole('button', { name: /upload logo/i })).toBeInTheDocument()
  })

  it('does not show upload logo button for non-admin', async () => {
    renderPage('EMPLOYEE')
    await waitFor(() => screen.getByText('Acme Corp'))
    expect(screen.queryByRole('button', { name: /upload logo/i })).not.toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    mockGetProfile.mockReturnValue(new Promise(() => {}))
    renderPage('HR_ADMIN')
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
