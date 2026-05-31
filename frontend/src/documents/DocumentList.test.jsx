import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DocumentList from './DocumentList'
import { documentApi } from '../api/documentApi'

vi.mock('../api/documentApi')

function wrapper(ui) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const EMP_ID = 'emp-123'
const stubDocs = [
  { id: 'doc-1', name: 'Contract.pdf', type: 'CONTRACT', fileSize: 204800, mimeType: 'application/pdf', createdAt: '2026-01-15T10:00:00Z' },
  { id: 'doc-2', name: 'Passport.jpg', type: 'ID', fileSize: 512000, mimeType: 'image/jpeg', createdAt: '2026-02-01T09:00:00Z' },
]

describe('DocumentList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading state initially', () => {
    documentApi.listByEmployee.mockReturnValue(new Promise(() => {}))
    wrapper(<DocumentList employeeId={EMP_ID} />)
    expect(screen.getByText(/loading documents/i)).toBeDefined()
  })

  it('renders document names when loaded', async () => {
    documentApi.listByEmployee.mockResolvedValue({ data: { data: stubDocs } })
    wrapper(<DocumentList employeeId={EMP_ID} />)
    await waitFor(() => expect(screen.getByText('Contract.pdf')).toBeDefined())
    expect(screen.getByText('Passport.jpg')).toBeDefined()
  })

  it('shows empty state when no documents', async () => {
    documentApi.listByEmployee.mockResolvedValue({ data: { data: [] } })
    wrapper(<DocumentList employeeId={EMP_ID} />)
    await waitFor(() => expect(screen.getByText(/no documents uploaded/i)).toBeDefined())
  })

  it('calls getDownloadUrl on download click', async () => {
    documentApi.listByEmployee.mockResolvedValue({ data: { data: stubDocs } })
    documentApi.getDownloadUrl.mockResolvedValue({ data: { data: { downloadUrl: 'http://localhost/file' } } })
    wrapper(<DocumentList employeeId={EMP_ID} />)
    await waitFor(() => screen.getByText('Contract.pdf'))
    const downloadBtns = screen.getAllByTitle('Download')
    fireEvent.click(downloadBtns[0])
    await waitFor(() => expect(documentApi.getDownloadUrl).toHaveBeenCalledWith('doc-1'))
  })

  it('calls delete on confirm', async () => {
    documentApi.listByEmployee.mockResolvedValue({ data: { data: stubDocs } })
    documentApi.delete.mockResolvedValue({})
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    wrapper(<DocumentList employeeId={EMP_ID} />)
    await waitFor(() => screen.getByText('Contract.pdf'))
    const deleteBtns = screen.getAllByTitle('Delete')
    fireEvent.click(deleteBtns[0])
    await waitFor(() => expect(documentApi.delete).toHaveBeenCalledWith('doc-1'))
  })

  it('does not call delete when confirm is cancelled', async () => {
    documentApi.listByEmployee.mockResolvedValue({ data: { data: stubDocs } })
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    wrapper(<DocumentList employeeId={EMP_ID} />)
    await waitFor(() => screen.getByText('Contract.pdf'))
    const deleteBtns = screen.getAllByTitle('Delete')
    fireEvent.click(deleteBtns[0])
    expect(documentApi.delete).not.toHaveBeenCalled()
  })
})
