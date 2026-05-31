import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LeaveTypesPage from './LeaveTypesPage'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockDeactivate = vi.fn()
const mockUpdate = vi.fn()
const mockGetChain = vi.fn()

vi.mock('../api/leaveApi', () => ({
  leaveApi: {
    listLeaveTypes: () => mockList(),
    createLeaveType: (d) => mockCreate(d),
    updateLeaveType: (id, d) => mockUpdate(id, d),
    deactivateLeaveType: (id) => mockDeactivate(id),
    getApprovalChain: () => mockGetChain(),
    setApprovalChain: vi.fn(),
  },
}))

const stubTypes = [
  { id: 'lt-1', name: 'Annual Leave', daysPerYear: 28, accrualMethod: 'IMMEDIATE', paid: true, requiresApproval: true, active: true },
  { id: 'lt-2', name: 'Sick Leave',   daysPerYear: 10, accrualMethod: 'NONE',      paid: true, requiresApproval: false, active: true },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LeaveTypesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LeaveTypesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ data: { data: stubTypes } })
    mockGetChain.mockResolvedValue({ data: { data: [] } })
  })

  it('renders leave type list', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Annual Leave')).toBeInTheDocument())
    expect(screen.getByText('Sick Leave')).toBeInTheDocument()
  })

  it('shows empty state when no leave types', async () => {
    mockList.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => expect(screen.getByText(/no leave types yet/i)).toBeInTheDocument())
  })

  it('opens create form when Add Leave Type clicked', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Annual Leave'))
    await userEvent.click(screen.getByText('Add Leave Type'))
    expect(screen.getByText('New Leave Type')).toBeInTheDocument()
  })

  it('submits create form', async () => {
    mockCreate.mockResolvedValue({ data: { data: {} } })
    renderPage()
    await waitFor(() => screen.getByText('Annual Leave'))
    await userEvent.click(screen.getByText('Add Leave Type'))
    // Type into the name input (first text input in the form)
    const nameInput = screen.getAllByRole('textbox')[0]
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Compassionate Leave')
    await userEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
  })
})
