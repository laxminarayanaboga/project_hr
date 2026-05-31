import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X } from 'lucide-react'
import { documentApi } from '../api/documentApi'

const DOC_TYPES = ['CONTRACT', 'ID', 'CERTIFICATE', 'OTHER']

export default function DocumentUpload({ employeeId, onDone }) {
  const queryClient = useQueryClient()
  const inputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [docType, setDocType] = useState('CONTRACT')
  const [docName, setDocName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const upload = useMutation({
    mutationFn: () =>
      documentApi.upload(
        employeeId,
        selectedFile,
        docType,
        docName || selectedFile?.name,
        (e) => setUploadProgress(Math.round((e.loaded / e.total) * 100)),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', employeeId] })
      setSelectedFile(null)
      setDocName('')
      setUploadProgress(0)
      setError('')
      onDone?.()
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Upload failed')
      setUploadProgress(0)
    },
  })

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) pick(file)
  }

  function pick(file) {
    setError('')
    setSelectedFile(file)
    if (!docName) setDocName(file.name.replace(/\.[^.]+$/, ''))
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Upload size={28} className="mx-auto text-gray-400 mb-2" />
        {selectedFile ? (
          <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">Drag and drop a file here, or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG — max 10MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => e.target.files[0] && pick(e.target.files[0])}
        />
      </div>

      {selectedFile && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Document name"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setSelectedFile(null); setDocName(''); setError('') }}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={() => upload.mutate()}
              disabled={upload.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
