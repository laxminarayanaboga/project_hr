import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ManagerDashboardPage from './ManagerDashboardPage'

const mockManagerStats = vi.fn()

vi.mock('../api/leaveApi', () => ({
  leaveApi: {
    managerStats: () => mockManagerStats(),
  },
}))

const stubData = {
  whoIsOffToday: [
    {
      employeeId: 'e-1',
      name: 'Bob Jones',
      leaveType: 'Annual Leave',
      startDate: '2026-05-31',
      endDate: '2026-06-02',
    },
  ],
  upcomingLeaves: [
    {
      employeeId: 'e-2',
      name: 'Alice Brown',
      leaveType: 'Sick Leave',
      startDate: '2026-06-10',
      endDate: '2026-06-11',
      workingDays: 2,
    },
  ],
  absenceStats: [
    {
      employeeId: 'e-1',
      name: 'Bob Jones',
      daysAbsentThisMonth: 2,
      absenceRatePercent: '9.1',
    },
    {
      employeeId: 'e-2',
      name: 'Alice Brown',
      daysAbsentThisMonth: 0,
      absenceRatePercent: '0.0',
    },
  ],
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ManagerDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ManagerDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockManagerStats.mockResolvedValue({ data: { data: stubData } })
  })

  it('renders page heading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText("Team Leave Overview")).toBeInTheDocument())
  })

  it('shows who is off today', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Annual Leave').length).toBeGreaterThan(0)
  })

  it('shows upcoming leaves section', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText('Alice Brown').length).toBeGreaterThan(0))
    expect(screen.getAllByText(/Sick Leave/).length).toBeGreaterThan(0)
  })

  it('shows absence stats table', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Team Leave Overview'))
    expect(screen.getByText('Monthly Absence Rate (this month)')).toBeInTheDocument()
    expect(screen.getByText('9.1%')).toBeInTheDocument()
  })

  it('shows empty state when nobody is off today', async () => {
    mockManagerStats.mockResolvedValue({
      data: {
        data: { ...stubData, whoIsOffToday: [] },
      },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText(/Everyone is in today/i)).toBeInTheDocument())
  })

  it('shows empty state when no team members', async () => {
    mockManagerStats.mockResolvedValue({
      data: {
        data: { whoIsOffToday: [], upcomingLeaves: [], absenceStats: [] },
      },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText(/No team members/i)).toBeInTheDocument())
  })
})
