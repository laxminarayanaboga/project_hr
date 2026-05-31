import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Trash2, FileText } from 'lucide-react'
import { documentApi } from '../api/documentApi'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DocumentList({ employeeId }) {
  const queryClient = useQueryClient()

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents', employeeId],
    queryFn: () => documentApi.listByEmployee(employeeId).then((r) => r.data.data),
  })

  const remove = useMutation({
    mutationFn: (id) => documentApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', employeeId] }),
  })

  async function handleDownload(docId, name) {
    const res = await documentApi.getDownloadUrl(docId)
    const url = res.data.data.downloadUrl
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', name)
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) return <div className="text-sm text-gray-400 py-4">Loading documents…</div>

  if (docs.length === 0) {
    return <div className="text-sm text-gray-400 py-4 text-center">No documents uploaded yet.</div>
  }

  return (
    <div className="divide-y divide-gray-100">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 py-3">
          <FileText size={18} className="text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
            <p className="text-xs text-gray-400">
              {doc.type} · {formatBytes(doc.fileSize)} · {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => handleDownload(doc.id, doc.name)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="Download"
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete "${doc.name}"?`)) remove.mutate(doc.id)
              }}
              className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
