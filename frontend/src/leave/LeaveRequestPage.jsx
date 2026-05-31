import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { leaveApi } from '../api/leaveApi'

const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

function LeaveRequestForm({ leaveTypes, onSubmit, onCancel, isSubmitting, error }) {
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Leave type</label>
        <select value={form.leaveTypeId} onChange={f('leaveTypeId')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          <option value="">Select a leave type</option>
          {leaveTypes.filter(l => l.active).map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
          <input type="date" value={form.startDate} onChange={f('startDate')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
          <input type="date" value={form.endDate} onChange={f('endDate')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
        <textarea value={form.reason} onChange={f('reason')} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      {error && <p className="text-sm text-red-600">{error?.response?.data?.message ?? 'Something went wrong'}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Submitting…' : 'Submit request'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  )
}

export default function LeaveRequestPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveApi.listLeaveTypes().then(r => r.data.data),
  })

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => leaveApi.myRequests().then(r => r.data.data),
  })

  const { data: balances = [] } = useQuery({
    queryKey: ['my-balances'],
    queryFn: () => leaveApi.myBalances().then(r => r.data.data),
  })

  const submit = useMutation({
    mutationFn: (data) => leaveApi.submitLeave(data),
    onSuccess: () => {
      qc.invalidateQueries(['my-leaves'])
      qc.invalidateQueries(['my-balances'])
      setShowForm(false)
    },
  })

  const cancel = useMutation({
    mutationFn: (id) => leaveApi.cancelLeave(id),
    onSuccess: () => qc.invalidateQueries(['my-leaves']),
  })

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Leave</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Request Leave
        </button>
      </div>

      {balances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {balances.map(b => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{b.leaveTypeName}</p>
              <p className="text-2xl font-bold text-blue-600">{b.remainingDays}</p>
              <p className="text-xs text-gray-400">{b.usedDays} used of {b.entitledDays + b.adjustedDays} days</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">New Leave Request</h2>
          <LeaveRequestForm leaveTypes={leaveTypes} onSubmit={(d) => submit.mutate(d)}
            onCancel={() => setShowForm(false)} isSubmitting={submit.isPending} error={submit.error} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Type', 'From', 'To', 'Days', 'Status', 'Reason', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No leave requests yet</td></tr>
            )}
            {requests.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.leaveTypeName}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(r.startDate)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(r.endDate)}</td>
                <td className="px-4 py-3 text-gray-600">{r.workingDays}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                    {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.reason ?? '—'}</td>
                <td className="px-4 py-3">
                  {r.status === 'PENDING' && (
                    <button onClick={() => cancel.mutate(r.id)} className="text-red-400 hover:text-red-600">
                      <X size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
