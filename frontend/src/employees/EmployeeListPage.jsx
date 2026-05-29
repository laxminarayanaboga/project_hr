import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Plus, UserCheck, UserX } from 'lucide-react'
import { employeeApi } from '../api/employeeApi'

export default function EmployeeListPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, status, page],
    queryFn: () => employeeApi.list({ search, status, page, size: 20 }).then(r => r.data.data),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Link
          to="/employees/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Employee
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search by name or employee number…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(0) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
            <option value="">All</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Job Title</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.content?.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/employees/${emp.id}`} className="flex items-center gap-3 hover:text-blue-600">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">#{emp.employeeNumber}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.jobTitle || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.departmentName || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      emp.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      emp.employmentStatus === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {emp.employmentStatus === 'ACTIVE' ? <UserCheck size={12} /> : <UserX size={12} />}
                      {emp.employmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.startDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {data.content?.length} of {data.totalElements} employees</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={!data.hasNext}
                className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
