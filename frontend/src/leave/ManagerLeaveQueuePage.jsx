import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { leaveApi } from '../api/leaveApi'

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

function RejectModal({ requestId, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Reject Leave Request</h3>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (required)"
          rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim() || isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            {isPending ? 'Rejecting…' : 'Reject'}
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function ManagerLeaveQueuePage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('pending') // 'pending' | 'calendar'
  const [rejectTarget, setRejectTarget] = useState(null)
  const today = new Date().toISOString().slice(0, 10)
  const monthEnd = new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 10)

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-leaves'],
    queryFn: () => leaveApi.pendingRequests().then(r => r.data.data),
    enabled: tab === 'pending',
  })

  const { data: calendar = [] } = useQuery({
    queryKey: ['team-calendar', today, monthEnd],
    queryFn: () => leaveApi.teamCalendar(today, monthEnd).then(r => r.data.data),
    enabled: tab === 'calendar',
  })

  const approve = useMutation({
    mutationFn: (id) => leaveApi.approveLeave(id, {}),
    onSuccess: () => qc.invalidateQueries(['pending-leaves']),
  })

  const reject = useMutation({
    mutationFn: ({ id, comment }) => leaveApi.rejectLeave(id, { comment }),
    onSuccess: () => { qc.invalidateQueries(['pending-leaves']); setRejectTarget(null) },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Leave</h1>
        <div className="flex gap-2">
          {['pending', 'calendar'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              {t === 'pending' ? 'Pending Approvals' : 'Team Calendar'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pending' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
              <p>No pending leave requests</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Type', 'From', 'To', 'Days', 'Reason', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.leaveTypeName}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(r.startDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(r.endDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.workingDays}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.reason ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => approve.mutate(r.id)}
                          disabled={approve.isPending}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setRejectTarget(r.id)}
                          className="text-red-500 hover:text-red-700" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {calendar.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
              <p>No approved leave in the next 2 months</p>
            </div>
          ) : calendar.map(e => (
            <div key={e.requestId} className="flex items-center gap-4 px-4 py-3">
              <div className="w-36 text-xs text-gray-500 font-medium">{formatDate(e.startDate)} → {formatDate(e.endDate)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.employeeName}</p>
                <p className="text-xs text-gray-500">{e.leaveTypeName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal requestId={rejectTarget} isPending={reject.isPending}
          onClose={() => setRejectTarget(null)}
          onConfirm={(comment) => reject.mutate({ id: rejectTarget, comment })} />
      )}
    </div>
  )
}
