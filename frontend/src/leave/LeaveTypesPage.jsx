import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, PowerOff, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { leaveApi } from '../api/leaveApi'
import ApprovalChainBuilder from './ApprovalChainBuilder'

const ACCRUAL_LABELS = { IMMEDIATE: 'Full year upfront', MONTHLY: 'Monthly accrual', NONE: 'No accrual' }

function LeaveTypeForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    daysPerYear: initial?.daysPerYear ?? 0,
    accrualMethod: initial?.accrualMethod ?? 'IMMEDIATE',
    paid: initial?.paid ?? true,
    requiresApproval: initial?.requiresApproval ?? true,
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Days per year</label>
        <input type="number" min="0" step="0.5" value={form.daysPerYear}
          onChange={(e) => setForm({ ...form, daysPerYear: parseFloat(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Accrual method</label>
        <select value={form.accrualMethod} onChange={(e) => setForm({ ...form, accrualMethod: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {Object.entries(ACCRUAL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} />
          Paid leave
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.requiresApproval}
            onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} />
          Requires approval
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  )
}

export default function LeaveTypesPage() {
  const qc = useQueryClient()
  const [panel, setPanel] = useState(null) // null | {mode:'create'} | {mode:'edit',lt} | {mode:'chain',lt}

  const { data: leaveTypes = [], isLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveApi.listLeaveTypes().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: (data) => leaveApi.createLeaveType(data),
    onSuccess: () => { qc.invalidateQueries(['leave-types']); setPanel(null) },
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => leaveApi.updateLeaveType(id, data),
    onSuccess: () => { qc.invalidateQueries(['leave-types']); setPanel(null) },
  })

  const deactivate = useMutation({
    mutationFn: (id) => leaveApi.deactivateLeaveType(id),
    onSuccess: () => qc.invalidateQueries(['leave-types']),
  })

  const handleSubmit = (data) => {
    if (panel?.mode === 'edit') update.mutate({ id: panel.lt.id, data })
    else create.mutate(data)
  }

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Types</h1>
        <button onClick={() => setPanel({ mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Leave Type
        </button>
      </div>

      {panel && panel.mode !== 'chain' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {panel.mode === 'edit' ? `Edit: ${panel.lt.name}` : 'New Leave Type'}
          </h2>
          <LeaveTypeForm initial={panel.lt} onSubmit={handleSubmit} onCancel={() => setPanel(null)}
            isSubmitting={create.isPending || update.isPending} />
        </div>
      )}

      {panel?.mode === 'chain' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Approval chain: {panel.lt.name}</h2>
            <button onClick={() => setPanel(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <ApprovalChainBuilder leaveTypeId={panel.lt.id} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Days/year', 'Accrual', 'Paid', 'Approval', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaveTypes.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No leave types yet</td></tr>
            )}
            {leaveTypes.map(lt => (
              <tr key={lt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{lt.name}</td>
                <td className="px-4 py-3 text-gray-600">{lt.daysPerYear}</td>
                <td className="px-4 py-3 text-gray-600">{ACCRUAL_LABELS[lt.accrualMethod]}</td>
                <td className="px-4 py-3">{lt.paid ? '✓' : '—'}</td>
                <td className="px-4 py-3">{lt.requiresApproval ? '✓' : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lt.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {lt.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPanel({ mode: 'edit', lt })}
                      className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => setPanel({ mode: 'chain', lt })}
                      className="text-gray-500 hover:text-gray-700 text-xs font-medium">Chain</button>
                    {lt.active && (
                      <button onClick={() => deactivate.mutate(lt.id)}
                        className="text-red-500 hover:text-red-700"><PowerOff size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
