import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '../api/employeeApi'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.get(id).then(r => r.data.data),
  })

  if (isLoading) return <div className="text-gray-400 text-sm p-8">Loading…</div>
  if (!data) return null

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
          {data.firstName[0]}{data.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.firstName} {data.lastName}</h1>
          <p className="text-gray-500">{data.jobTitle} · {data.departmentName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{data.personalEmail || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{data.phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date of Birth</dt>
              <dd className="text-gray-900">{data.dateOfBirth || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Nationality</dt>
              <dd className="text-gray-900">{data.nationality || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Employment Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Employee #</dt>
              <dd className="text-gray-900">{data.employeeNumber || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900">{data.employmentType || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Start Date</dt>
              <dd className="text-gray-900">{data.startDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  data.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>{data.employmentStatus}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
