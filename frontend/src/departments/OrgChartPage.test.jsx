import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import OrgChartPage from './OrgChartPage'

const mockOrgChart = vi.fn()

vi.mock('../api/departmentApi', () => ({
  departmentApi: {
    orgChart: () => mockOrgChart(),
  },
}))

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <OrgChartPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const tree = [
  {
    id: 'dept-1',
    name: 'Engineering',
    description: 'Builds things',
    employeeCount: 5,
    children: [
      { id: 'dept-2', name: 'Frontend', description: null, employeeCount: 2, children: [] },
      { id: 'dept-3', name: 'Backend', description: null, employeeCount: 3, children: [] },
    ],
  },
  {
    id: 'dept-4',
    name: 'Marketing',
    description: 'Go-to-market',
    employeeCount: 0,
    children: [],
  },
]

describe('OrgChartPage', () => {
  beforeEach(() => {
    mockOrgChart.mockResolvedValue({ data: { data: tree } })
  })

  it('renders the heading', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: /org chart/i })).toBeInTheDocument()
  })

  it('renders root department nodes', async () => {
    renderPage()
    expect(await screen.findByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('renders child nodes nested under parent', async () => {
    renderPage()
    expect(await screen.findByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
  })

  it('shows employee count for departments with employees', async () => {
    renderPage()
    await screen.findByText('Engineering')
    // The count is rendered as text — check for "5" and "2" within count badges
    const fives = screen.getAllByText('5')
    expect(fives.length).toBeGreaterThan(0)
  })

  it('collapses children when toggle button is clicked', async () => {
    renderPage()
    await screen.findByText('Engineering')

    // Frontend child is initially visible
    expect(screen.getByText('Frontend')).toBeInTheDocument()

    // Click the collapse button on the Engineering node (first one with children)
    const collapseBtn = screen.getAllByRole('button', { name: /collapse/i })[0]
    fireEvent.click(collapseBtn)

    // Frontend and Backend should be hidden
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument()
    expect(screen.queryByText('Backend')).not.toBeInTheDocument()
  })

  it('expands children again after collapsing', async () => {
    renderPage()
    await screen.findByText('Engineering')

    const collapseBtn = screen.getAllByRole('button', { name: /collapse/i })[0]
    fireEvent.click(collapseBtn) // collapse
    fireEvent.click(collapseBtn) // expand

    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })

  it('renders links to /departments for each node', async () => {
    renderPage()
    await screen.findByText('Engineering')
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    links.forEach(link => expect(link).toHaveAttribute('href', '/departments'))
  })

  it('shows empty state when no departments', async () => {
    mockOrgChart.mockResolvedValue({ data: { data: [] } })
    renderPage()
    expect(await screen.findByText(/no departments yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add a department/i })).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    mockOrgChart.mockRejectedValue(new Error('Network error'))
    renderPage()
    expect(await screen.findByText(/failed to load org chart/i)).toBeInTheDocument()
  })
})
