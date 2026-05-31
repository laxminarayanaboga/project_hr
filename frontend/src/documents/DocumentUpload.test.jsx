import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DocumentUpload from './DocumentUpload'
import { documentApi } from '../api/documentApi'

vi.mock('../api/documentApi')

function wrapper(ui) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('DocumentUpload', () => {
  const EMP_ID = 'emp-123'

  beforeEach(() => vi.clearAllMocks())

  it('renders drag-and-drop zone', () => {
    wrapper(<DocumentUpload employeeId={EMP_ID} />)
    expect(screen.getByText(/drag and drop/i)).toBeDefined()
  })

  it('shows file name after selection', () => {
    wrapper(<DocumentUpload employeeId={EMP_ID} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('contract.pdf')).toBeDefined()
  })

  it('shows Upload and Cancel buttons after file selection', () => {
    wrapper(<DocumentUpload employeeId={EMP_ID} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'id.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByRole('button', { name: /upload/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })

  it('cancels and clears state on Cancel click', () => {
    wrapper(<DocumentUpload employeeId={EMP_ID} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText('doc.pdf')).toBeNull()
  })

  it('calls documentApi.upload on submit', async () => {
    documentApi.upload.mockResolvedValue({ data: { data: { id: '1', name: 'contract.pdf' } } })
    wrapper(<DocumentUpload employeeId={EMP_ID} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /^upload$/i }))
    await waitFor(() => expect(documentApi.upload).toHaveBeenCalledWith(
      EMP_ID, file, 'CONTRACT', expect.any(String), expect.any(Function)
    ))
  })

  it('shows error message on upload failure', async () => {
    documentApi.upload.mockRejectedValue({ response: { data: { message: 'File too large' } } })
    wrapper(<DocumentUpload employeeId={EMP_ID} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'big.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /^upload$/i }))
    await waitFor(() => expect(screen.getByText('File too large')).toBeDefined())
  })
})
