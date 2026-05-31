import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import api from '../api/axios'
import { reportsApi } from '../api/reportsApi'

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

const STATUS_STYLES = {
  APPROVED:  'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const thisYear = new Date().getFullYear()
const DEFAULT_FILTERS = {
  from: `${thisYear}-01-01`,
  to: `${thisYear}-12-31`,
  employeeId: '',
  departmentId: '',
  leaveTypeId: '',
}

export default function ReportsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [applied, setApplied] = useState(DEFAULT_FILTERS)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then(r => r.data.data),
  })
  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => api.get('/leave-types').then(r => r.data.data),
  })

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['leave-report', applied],
    queryFn: () => reportsApi.getLeaveReport(clean(applied)).then(r => r.data.data),
    enabled: !!applied.from && !!applied.to,
  })

  function clean(f) {
    const p = { from: f.from, to: f.to }
    if (f.employeeId)   p.employeeId   = f.employeeId
    if (f.departmentId) p.departmentId = f.departmentId
    if (f.leaveTypeId)  p.leaveTypeId  = f.leaveTypeId
    return p
  }

  function handleApply(e) {
    e.preventDefault()
    setApplied({ ...filters })
  }

  async function handleExport(format) {
    const res = await reportsApi.exportLeave({ ...clean(applied), format })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `leave-report.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave & Absence Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            aria-label="Export CSV"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            aria-label="Export PDF"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleApply} className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={filters.from} onChange={f('from')} required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={filters.to} onChange={f('to')} required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
          <select value={filters.departmentId} onChange={f('departmentId')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]">
            <option value="">All departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Leave type</label>
          <select value={filters.leaveTypeId} onChange={f('leaveTypeId')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]">
            <option value="">All types</option>
            {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <button type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Apply filters
        </button>
      </form>

      {report && (
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 min-w-[150px]">
            <p className="text-xs text-gray-500 mb-1">Total days absent</p>
            <p className="text-2xl font-bold text-blue-600">{report.grandTotal}</p>
          </div>
          {Object.entries(report.totalsByLeaveType).map(([type, days]) => (
            <div key={type} className="bg-white border border-gray-200 rounded-xl px-5 py-4 min-w-[150px]">
              <p className="text-xs text-gray-500 mb-1">{type}</p>
              <p className="text-2xl font-bold text-gray-800">{days}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading && <p className="px-6 py-8 text-center text-gray-400 text-sm">Loading…</p>}
        {isError && <p className="px-6 py-8 text-center text-red-500 text-sm">Failed to load report</p>}
        {!isLoading && !isError && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Employee', 'Emp #', 'Department', 'Leave type', 'From', 'To', 'Days', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!report?.rows?.length) && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records for this period</td></tr>
              )}
              {report?.rows?.map(r => (
                <tr key={r.requestId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.employeeName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.employeeNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.department || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.leaveType}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.endDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.workingDays}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? ''}`}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
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
