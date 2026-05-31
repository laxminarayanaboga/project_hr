import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AttendanceWidget from './AttendanceWidget'

const mockToday   = vi.fn()
const mockClockIn = vi.fn()
const mockClockOut = vi.fn()

vi.mock('../api/attendanceApi', () => ({
  attendanceApi: {
    today:    () => mockToday(),
    clockIn:  () => mockClockIn(),
    clockOut: () => mockClockOut(),
  },
}))

function renderWidget() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <AttendanceWidget />
    </QueryClientProvider>
  )
}

describe('AttendanceWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Clock In button when no active session', async () => {
    mockToday.mockResolvedValue({ data: { data: { active: false, clockIn: null, clockOut: null } } })
    renderWidget()
    await waitFor(() => expect(screen.getByRole('button', { name: /clock in/i })).toBeInTheDocument())
  })

  it('shows Clock Out button when session is active', async () => {
    mockToday.mockResolvedValue({ data: { data: { active: true, clockIn: new Date().toISOString(), clockOut: null } } })
    renderWidget()
    await waitFor(() => expect(screen.getByRole('button', { name: /clock out/i })).toBeInTheDocument())
  })

  it('shows Done for today when session is complete', async () => {
    mockToday.mockResolvedValue({
      data: {
        data: { active: false, clockIn: new Date().toISOString(), clockOut: new Date().toISOString() },
      },
    })
    renderWidget()
    await waitFor(() => expect(screen.getByText(/done for today/i)).toBeInTheDocument())
  })

  it('calls clockIn on button click', async () => {
    mockToday.mockResolvedValue({ data: { data: { active: false, clockIn: null, clockOut: null } } })
    mockClockIn.mockResolvedValue({ data: { data: {} } })
    renderWidget()
    const btn = await screen.findByRole('button', { name: /clock in/i })
    await userEvent.click(btn)
    expect(mockClockIn).toHaveBeenCalledOnce()
  })

  it('shows error message on clockIn failure', async () => {
    mockToday.mockResolvedValue({ data: { data: { active: false, clockIn: null, clockOut: null } } })
    mockClockIn.mockRejectedValue({ response: { data: { message: 'Already clocked in' } } })
    renderWidget()
    const btn = await screen.findByRole('button', { name: /clock in/i })
    await userEvent.click(btn)
    await waitFor(() => expect(screen.getByText('Already clocked in')).toBeInTheDocument())
  })
})
