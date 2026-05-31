import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import OvertimePage from './OvertimePage'

const mockOvertime = vi.fn()
const mockApprove  = vi.fn()

vi.mock('../api/attendanceApi', () => ({
  attendanceApi: {
    teamOvertime:    () => mockOvertime(),
    approveOvertime: (id, action) => mockApprove(id, action),
  },
}))

const stubRecords = [
  {
    id: 'ot-1',
    employeeId: 'emp-1',
    employeeName: 'Jane Doe',
    workDate: '2026-05-30',
    hoursWorked: 10,
    contractedHours: 8,
    overtimeHours: 2,
    status: 'PENDING',
    approvedAt: null,
  },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <OvertimePage />
    </QueryClientProvider>
  )
}

describe('OvertimePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders overtime records', async () => {
    mockOvertime.mockResolvedValue({ data: { data: stubRecords } })
    renderPage()
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument())
    expect(screen.getByText('+2.00h')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
  })

  it('shows empty state when no records', async () => {
    mockOvertime.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => expect(screen.getByText(/no overtime records/i)).toBeInTheDocument())
  })

  it('shows Approve and Reject buttons for PENDING records', async () => {
    mockOvertime.mockResolvedValue({ data: { data: stubRecords } })
    renderPage()
    await waitFor(() => expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('calls approveOvertime with APPROVE on approve click', async () => {
    mockOvertime.mockResolvedValue({ data: { data: stubRecords } })
    mockApprove.mockResolvedValue({ data: { data: { ...stubRecords[0], status: 'APPROVED' } } })
    renderPage()
    const btn = await screen.findByRole('button', { name: /approve/i })
    await userEvent.click(btn)
    expect(mockApprove).toHaveBeenCalledWith('ot-1', 'APPROVE')
  })

  it('calls approveOvertime with REJECT on reject click', async () => {
    mockOvertime.mockResolvedValue({ data: { data: stubRecords } })
    mockApprove.mockResolvedValue({ data: { data: { ...stubRecords[0], status: 'REJECTED' } } })
    renderPage()
    const btn = await screen.findByRole('button', { name: /reject/i })
    await userEvent.click(btn)
    expect(mockApprove).toHaveBeenCalledWith('ot-1', 'REJECT')
  })
})
