import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { attendanceApi } from '../api/attendanceApi'
import AttendanceWidget from './AttendanceWidget'

export default function AttendancePage() {
  const [page, setPage] = useState(0)

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance-history', page],
    queryFn: () => attendanceApi.history(page, 20).then(r => r.data.data),
  })

  const formatDateTime = (iso) => iso
    ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : '—'

  const formatHours = (h) => h != null ? `${Number(h).toFixed(2)}h` : '—'

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Clock size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AttendanceWidget />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">History</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No attendance records found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Clock In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Clock Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Hours Worked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{formatDateTime(r.clockIn)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDateTime(r.clockOut)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatHours(r.hoursWorked)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      r.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {r.active ? 'Active' : 'Complete'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="px-6 py-3 border-t border-gray-100 flex gap-2 justify-end">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={records.length < 20}
            className="px-3 py-1 text-sm rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
