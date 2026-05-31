import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LeaveBalancePage from './LeaveBalancePage'

const mockBalances = vi.fn()

vi.mock('../api/leaveApi', () => ({
  leaveApi: {
    myBalances: () => mockBalances(),
  },
}))

const stubBalances = [
  { id: 'b-1', leaveTypeName: 'Annual Leave', year: 2026, entitledDays: 28, usedDays: 5, adjustedDays: 0, remainingDays: 23 },
  { id: 'b-2', leaveTypeName: 'Sick Leave',   year: 2026, entitledDays: 10, usedDays: 0, adjustedDays: 0, remainingDays: 10 },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LeaveBalancePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LeaveBalancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBalances.mockResolvedValue({ data: { data: stubBalances } })
  })

  it('renders balance cards for each leave type', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Annual Leave')).toBeInTheDocument())
    expect(screen.getByText('Sick Leave')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('shows empty state when no balances', async () => {
    mockBalances.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => expect(screen.getByText(/no leave balances/i)).toBeInTheDocument())
  })

  it('shows usage stats on each card', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Annual Leave'))
    expect(screen.getByText('5 days used')).toBeInTheDocument()
  })
})
