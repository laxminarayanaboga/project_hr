import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeFormPage from './EmployeeFormPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockDeptList = vi.fn()
const mockEmpList = vi.fn()
const mockEmpGet = vi.fn()
const mockEmpCreate = vi.fn()
const mockEmpUpdate = vi.fn()

vi.mock('../api/departmentApi', () => ({
  departmentApi: { list: () => mockDeptList() },
}))

vi.mock('../api/employeeApi', () => ({
  employeeApi: {
    list: (...args) => mockEmpList(...args),
    get: (id) => mockEmpGet(id),
    create: (data) => mockEmpCreate(data),
    update: (id, data) => mockEmpUpdate(id, data),
  },
}))

function renderForm(path = '/employees/new') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/employees/new" element={<EmployeeFormPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDeptList.mockResolvedValue({ data: { data: [] } })
  mockEmpList.mockResolvedValue({ data: { data: { content: [] } } })
})

describe('EmployeeFormPage — create mode', () => {
  it('renders create form heading', () => {
    renderForm()
    expect(screen.getByText('Add Employee')).toBeInTheDocument()
  })

  it('renders first name and last name inputs', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Smith')).toBeInTheDocument()
  })

  it('shows validation error when first name is missing', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /create employee/i }))
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
  })

  it('shows validation error when start date is missing', async () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByPlaceholderText('Smith'), { target: { value: 'Johnson' } })
    fireEvent.click(screen.getByRole('button', { name: /create employee/i }))
    await waitFor(() => {
      expect(screen.getByText('Start date is required')).toBeInTheDocument()
    })
  })

  it('calls employeeApi.create on valid submission', async () => {
    mockEmpCreate.mockResolvedValue({ data: { data: { id: 'new-id' } } })
    renderForm()

    fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByPlaceholderText('Smith'), { target: { value: 'Johnson' } })
    const dateInputs = document.querySelectorAll('input[type="date"]')
    // dateInputs[0] = dateOfBirth, dateInputs[1] = startDate
    fireEvent.change(dateInputs[1], { target: { value: '2026-01-15' } })

    fireEvent.click(screen.getByRole('button', { name: /create employee/i }))

    await waitFor(() => {
      expect(mockEmpCreate).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Alice',
        lastName: 'Johnson',
        startDate: '2026-01-15',
      }))
    })
  })
})

describe('EmployeeFormPage — edit mode', () => {
  const existingEmployee = {
    id: 'emp-1',
    firstName: 'Jane',
    lastName: 'Smith',
    jobTitle: 'Engineer',
    startDate: '2026-01-15',
    employmentStatus: 'ACTIVE',
    preferredName: null,
    dateOfBirth: null,
    gender: null,
    nationality: null,
    phone: null,
    personalEmail: null,
    address: null,
    employeeNumber: 'EMP-2026-0001',
    employmentType: 'FULL_TIME',
    endDate: null,
    probationEnd: null,
    departmentId: null,
    managerId: null,
  }

  beforeEach(() => {
    mockEmpGet.mockResolvedValue({ data: { data: existingEmployee } })
  })

  it('renders edit form heading', async () => {
    renderForm('/employees/emp-1/edit')
    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument()
    })
  })

  it('pre-fills first and last name from existing employee', async () => {
    renderForm('/employees/emp-1/edit')
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
    })
  })

  it('calls employeeApi.update on valid submission', async () => {
    mockEmpUpdate.mockResolvedValue({ data: { data: existingEmployee } })
    renderForm('/employees/emp-1/edit')

    await waitFor(() => screen.getByDisplayValue('Jane'))

    fireEvent.change(screen.getByDisplayValue('Jane'), { target: { value: 'Janet' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockEmpUpdate).toHaveBeenCalledWith('emp-1', expect.objectContaining({ firstName: 'Janet' }))
    })
  })
})
