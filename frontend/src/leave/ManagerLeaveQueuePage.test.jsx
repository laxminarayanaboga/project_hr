import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ManagerLeaveQueuePage from './ManagerLeaveQueuePage'

const mockPending = vi.fn()
const mockCalendar = vi.fn()
const mockApprove = vi.fn()
const mockReject = vi.fn()

vi.mock('../api/leaveApi', () => ({
  leaveApi: {
    pendingRequests: () => mockPending(),
    teamCalendar: () => mockCalendar(),
    approveLeave: (id, d) => mockApprove(id, d),
    rejectLeave: (id, d) => mockReject(id, d),
  },
}))

const stubPending = [
  {
    id: 'lr-1', employeeName: 'Jane Smith', leaveTypeName: 'Annual Leave',
    startDate: '2026-09-01', endDate: '2026-09-05', workingDays: 5, reason: 'Holiday',
  },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ManagerLeaveQueuePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ManagerLeaveQueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPending.mockResolvedValue({ data: { data: stubPending } })
    mockCalendar.mockResolvedValue({ data: { data: [] } })
  })

  it('renders pending leave requests', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Jane Smith')).toBeInTheDocument())
    expect(screen.getByText('Annual Leave')).toBeInTheDocument()
  })

  it('shows empty state when no pending requests', async () => {
    mockPending.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => expect(screen.getByText(/no pending leave/i)).toBeInTheDocument())
  })

  it('calls approve when approve button clicked', async () => {
    mockApprove.mockResolvedValue({ data: { data: {} } })
    renderPage()
    await waitFor(() => screen.getByText('Jane Smith'))
    const approveBtn = screen.getByTitle('Approve')
    await userEvent.click(approveBtn)
    await waitFor(() => expect(mockApprove).toHaveBeenCalledWith('lr-1', {}))
  })

  it('opens reject modal when reject button clicked', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Jane Smith'))
    await userEvent.click(screen.getByTitle('Reject'))
    expect(screen.getByText('Reject Leave Request')).toBeInTheDocument()
  })

  it('switches to team calendar tab', async () => {
    mockCalendar.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => screen.getByText('Team Calendar'))
    await userEvent.click(screen.getByText('Team Calendar'))
    await waitFor(() => expect(screen.getByText(/no approved leave/i)).toBeInTheDocument())
  })
})
