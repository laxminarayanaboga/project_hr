import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, UserX, ArrowLeft, Upload } from 'lucide-react'
import { employeeApi } from '../api/employeeApi'
import { useAuth } from '../auth/useAuth'
import DocumentList from '../documents/DocumentList'
import DocumentUpload from '../documents/DocumentUpload'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [showUpload, setShowUpload] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.get(id).then(r => r.data.data),
  })

  const deactivate = useMutation({
    mutationFn: () => employeeApi.deactivate(id, { reason: 'Manual deactivation' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  if (isLoading) return <div className="text-gray-400 text-sm p-8">Loading…</div>
  if (!data) return null

  const isActive = data.employmentStatus === 'ACTIVE'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/employees" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            {data.firstName[0]}{data.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{data.firstName} {data.lastName}</h1>
            <p className="text-gray-500 text-sm">{data.jobTitle}{data.departmentName ? ` · ${data.departmentName}` : ''}</p>
          </div>
          <div className="flex gap-2">
            {isActive && (
              <>
                <Link
                  to={`/employees/${id}/edit`}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm(`Deactivate ${data.firstName} ${data.lastName}?`)) {
                      deactivate.mutate()
                    }
                  }}
                  disabled={deactivate.isPending}
                  className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <UserX size={14} /> Deactivate
                </button>
              </>
            )}
            {!isActive && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                {data.employmentStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Email" value={data.personalEmail} />
            <Row label="Phone" value={data.phone} />
            <Row label="Date of Birth" value={data.dateOfBirth} />
            <Row label="Nationality" value={data.nationality} />
            <Row label="Gender" value={data.gender} />
            <Row label="Address" value={data.address} />
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Employment Details</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Employee #" value={data.employeeNumber} />
            <Row label="Type" value={data.employmentType} />
            <Row label="Department" value={data.departmentName} />
            <Row label="Manager" value={data.managerName} />
            <Row label="Start Date" value={data.startDate} />
            <Row label="Probation End" value={data.probationEnd} />
            <Row label="End Date" value={data.endDate} />
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  data.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  data.employmentStatus === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{data.employmentStatus}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Documents</h2>
          {user?.role === 'HR_ADMIN' && (
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload size={14} />
              {showUpload ? 'Cancel upload' : 'Upload document'}
            </button>
          )}
        </div>
        {showUpload && (
          <div className="mb-4">
            <DocumentUpload employeeId={id} onDone={() => setShowUpload(false)} />
          </div>
        )}
        <DocumentList employeeId={id} />
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 text-right">{value || '—'}</dd>
    </div>
  )
}
