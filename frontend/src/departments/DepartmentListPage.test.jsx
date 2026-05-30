import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import DepartmentListPage from './DepartmentListPage'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../api/departmentApi', () => ({
  departmentApi: {
    list: () => mockList(),
    create: (data) => mockCreate(data),
    update: (id, data) => mockUpdate(id, data),
    delete: (id) => mockDelete(id),
  },
}))

const stubDepts = [
  { id: 'dept-1', name: 'Engineering', description: 'Builds things', parentId: null, parentName: null },
  { id: 'dept-2', name: 'Marketing', description: null, parentId: null, parentName: null },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DepartmentListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DepartmentListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ data: { data: stubDepts } })
  })

  it('renders department list', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument())
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Builds things')).toBeInTheDocument()
  })

  it('shows empty state when no departments', async () => {
    mockList.mockResolvedValue({ data: { data: [] } })
    renderPage()
    await waitFor(() => expect(screen.getByText(/no departments yet/i)).toBeInTheDocument())
  })

  it('shows create form when Add Department clicked', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Engineering'))

    fireEvent.click(screen.getByRole('button', { name: /add department/i }))

    expect(screen.getByText('New Department')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\. engineering/i)).toBeInTheDocument()
  })

  it('creates a department on form submit', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({ data: { data: { id: 'new', name: 'HR', description: null, parentId: null, parentName: null } } })
    renderPage()
    await waitFor(() => screen.getByText('Engineering'))

    await user.click(screen.getByRole('button', { name: /add department/i }))
    await user.type(screen.getByPlaceholderText(/e\.g\. engineering/i), 'HR')
    await user.click(screen.getByRole('button', { name: /create department/i }))

    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'HR' })))
  })

  it('shows edit form pre-filled when edit clicked', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Engineering'))

    const editButtons = screen.getAllByTitle('Edit')
    fireEvent.click(editButtons[0])

    await waitFor(() => expect(screen.getByDisplayValue('Engineering')).toBeInTheDocument())
    expect(screen.getByDisplayValue('Builds things')).toBeInTheDocument()
  })

  it('shows error message when delete fails', async () => {
    mockDelete.mockRejectedValue({
      response: { data: { message: 'Cannot delete a department with active employees' } },
    })
    window.confirm = vi.fn(() => true)
    renderPage()
    await waitFor(() => screen.getByText('Engineering'))

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() =>
      expect(screen.getByText(/cannot delete a department with active employees/i)).toBeInTheDocument()
    )
  })
})
