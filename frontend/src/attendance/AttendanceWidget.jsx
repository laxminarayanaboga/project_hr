import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { attendanceApi } from '../api/attendanceApi'

export default function AttendanceWidget() {
  const qc = useQueryClient()
  const [error, setError] = useState(null)

  const { data: status, isLoading } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => attendanceApi.today().then(r => r.data.data),
  })

  const clockIn = useMutation({
    mutationFn: () => attendanceApi.clockIn(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance-today'] }); setError(null) },
    onError: (e) => setError(e.response?.data?.message || 'Failed to clock in'),
  })

  const clockOut = useMutation({
    mutationFn: () => attendanceApi.clockOut(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-today'] })
      qc.invalidateQueries({ queryKey: ['attendance-history'] })
      setError(null)
    },
    onError: (e) => setError(e.response?.data?.message || 'Failed to clock out'),
  })

  const formatTime = (iso) => iso
    ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—'

  if (isLoading) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900">Attendance</h2>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          {status?.active ? (
            <p className="text-sm text-gray-600">
              Clocked in at <span className="font-medium">{formatTime(status.clockIn)}</span>
            </p>
          ) : status?.clockIn ? (
            <p className="text-sm text-gray-600">
              {formatTime(status.clockIn)} – {formatTime(status.clockOut)}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Not clocked in today</p>
          )}
        </div>

        <div
          className={`w-3 h-3 rounded-full ${status?.active ? 'bg-green-500' : 'bg-gray-300'}`}
          title={status?.active ? 'Active session' : 'No active session'}
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {!status?.active && !status?.clockOut ? (
        <button
          onClick={() => clockIn.mutate()}
          disabled={clockIn.isPending}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
        >
          <LogIn size={16} />
          {clockIn.isPending ? 'Clocking in…' : 'Clock In'}
        </button>
      ) : status?.active ? (
        <button
          onClick={() => clockOut.mutate()}
          disabled={clockOut.isPending}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
        >
          <LogOut size={16} />
          {clockOut.isPending ? 'Clocking out…' : 'Clock Out'}
        </button>
      ) : (
        <p className="text-xs text-center text-gray-400">Done for today</p>
      )}
    </div>
  )
}
