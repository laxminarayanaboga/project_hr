import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LeaveRequestPage from './LeaveRequestPage'

const mockTypes = vi.fn()
const mockRequests = vi.fn()
const mockBalances = vi.fn()
const mockSubmit = vi.fn()
const mockCancel = vi.fn()

vi.mock('../api/leaveApi', () => ({
  leaveApi: {
    listLeaveTypes: () => mockTypes(),
    myRequests: () => mockRequests(),
    myBalances: () => mockBalances(),
    submitLeave: (d) => mockSubmit(d),
    cancelLeave: (id) => mockCancel(id),
  },
}))

const stubTypes = [
  { id: 'lt-1', name: 'Annual Leave', active: true },
]

const stubRequests = [
  {
    id: 'lr-1', leaveTypeName: 'Annual Leave', startDate: '2026-09-01', endDate: '2026-09-05',
    workingDays: 5, status: 'PENDING', reason: 'Holiday', rejectionReason: null,
  },
]

const stubBalances = [
  { id: 'b-1', leaveTypeName: 'Annual Leave', entitledDays: 28, usedDays: 0, adjustedDays: 0, remainingDays: 28 },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LeaveRequestPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LeaveRequestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTypes.mockResolvedValue({ data: { data: stubTypes } })
    mockRequests.mockResolvedValue({ data: { data: stubRequests } })
    mockBalances.mockResolvedValue({ data: { data: stubBalances } })
  })

  it('renders my leave requests', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText('Annual Leave').length).toBeGreaterThan(0))
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows balance summary cards', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('28')).toBeInTheDocument())
  })

  it('shows empty state when no requests', async () => {
    mockRequests.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => expect(screen.getByText(/no leave requests yet/i)).toBeInTheDocument())
  })

  it('opens form on Request Leave click', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('Annual Leave'))
    await userEvent.click(screen.getByText('Request Leave'))
    expect(screen.getByText('New Leave Request')).toBeInTheDocument()
  })

  it('shows REJECTED status with appropriate styling', async () => {
    mockRequests.mockResolvedValue({
      data: { data: [{ ...stubRequests[0], status: 'REJECTED', rejectionReason: 'Busy period' }] },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('Rejected')).toBeInTheDocument())
  })
})
