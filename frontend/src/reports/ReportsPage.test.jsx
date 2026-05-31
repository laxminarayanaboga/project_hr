import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ReportsPage from './ReportsPage'

vi.mock('../api/reportsApi', () => ({
  reportsApi: {
    getLeaveReport: () => mockGetReport(),
    exportLeave: () => mockExport(),
  },
}))

vi.mock('../api/axios', () => ({
  default: {
    get: (url) => {
      if (url === '/departments') return Promise.resolve({ data: { data: [] } })
      if (url === '/leave-types')  return Promise.resolve({ data: { data: [] } })
      return Promise.resolve({ data: { data: [] } })
    },
  },
}))

let mockGetReport = vi.fn()
let mockExport    = vi.fn()

const stubReport = {
  rows: [
    {
      requestId: 'r-1',
      employeeName: 'Jane Smith',
      employeeNumber: 'EMP001',
      department: 'Engineering',
      leaveType: 'Annual Leave',
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      workingDays: 5,
      status: 'APPROVED',
    },
  ],
  totalsByLeaveType: { 'Annual Leave': 5 },
  grandTotal: 5,
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetReport.mockResolvedValue({ data: { data: stubReport } })
  })

  it('renders page title', async () => {
    renderPage()
    expect(screen.getByText('Leave & Absence Reports')).toBeInTheDocument()
  })

  it('shows report rows after load', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Jane Smith')).toBeInTheDocument())
    expect(screen.getAllByText('Annual Leave').length).toBeGreaterThan(0)
    expect(screen.getByText('EMP001')).toBeInTheDocument()
  })

  it('shows grand total stat card', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Jane Smith'))
    expect(screen.getByText('Total days absent')).toBeInTheDocument()
  })

  it('shows empty state when no rows', async () => {
    mockGetReport.mockResolvedValue({
      data: { data: { rows: [], totalsByLeaveType: {}, grandTotal: 0 } },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText(/No records for this period/i)).toBeInTheDocument())
  })

  it('renders export buttons', () => {
    renderPage()
    expect(screen.getByLabelText('Export CSV')).toBeInTheDocument()
    expect(screen.getByLabelText('Export PDF')).toBeInTheDocument()
  })

  it('renders filter form with date inputs', () => {
    renderPage()
    expect(screen.getByText('Apply filters')).toBeInTheDocument()
  })
})
