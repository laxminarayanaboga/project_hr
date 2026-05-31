import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Timer, Check, X } from 'lucide-react'
import { attendanceApi } from '../api/attendanceApi'

const STATUS_STYLES = {
  PENDING:  'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export default function OvertimePage() {
  const qc = useQueryClient()
  const [processing, setProcessing] = useState(null)

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['overtime'],
    queryFn: () => attendanceApi.teamOvertime().then(r => r.data.data),
  })

  const act = useMutation({
    mutationFn: ({ id, action }) => attendanceApi.approveOvertime(id, action),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['overtime'] }); setProcessing(null) },
    onError: () => setProcessing(null),
  })

  const handle = (id, action) => {
    setProcessing(id + action)
    act.mutate({ id, action })
  }

  const formatHours = (h) => `${Number(h).toFixed(2)}h`

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Timer size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Overtime</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No overtime records found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Worked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Contracted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Overtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.employeeName}</td>
                  <td className="px-6 py-4 text-gray-700">{r.workDate}</td>
                  <td className="px-6 py-4 text-gray-700">{formatHours(r.hoursWorked)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatHours(r.contractedHours)}</td>
                  <td className="px-6 py-4 font-semibold text-orange-600">+{formatHours(r.overtimeHours)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handle(r.id, 'APPROVE')}
                          disabled={!!processing}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handle(r.id, 'REJECT')}
                          disabled={!!processing}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded disabled:opacity-50"
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
