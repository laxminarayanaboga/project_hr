import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { leaveApi } from '../api/leaveApi'

function HolidayForm({ onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({ name: '', holidayDate: '' })
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex items-end gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Christmas Day"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" value={form.holidayDate} onChange={(e) => setForm({ ...form, holidayDate: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
      </div>
      <button type="submit" disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? 'Adding…' : 'Add'}
      </button>
      <button type="button" onClick={onCancel}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
    </form>
  )
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function PublicHolidaysPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['public-holidays'],
    queryFn: () => leaveApi.listHolidays().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: (data) => leaveApi.createHoliday(data),
    onSuccess: () => { qc.invalidateQueries(['public-holidays']); setShowForm(false) },
  })

  const remove = useMutation({
    mutationFn: (id) => leaveApi.deleteHoliday(id),
    onSuccess: () => qc.invalidateQueries(['public-holidays']),
  })

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>

  const byYear = holidays.reduce((acc, h) => {
    const y = h.holidayDate.slice(0, 4)
    if (!acc[y]) acc[y] = []
    acc[y].push(h)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Public Holidays</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Holiday
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <HolidayForm onSubmit={(d) => create.mutate(d)} onCancel={() => setShowForm(false)}
            isSubmitting={create.isPending} />
          {create.isError && <p className="text-sm text-red-600 mt-2">{create.error?.response?.data?.message}</p>}
        </div>
      )}

      {Object.keys(byYear).sort().map(year => (
        <div key={year} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CalendarDays size={18} /> {year}
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {byYear[year].map(h => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(h.holidayDate)}</p>
                </div>
                <button onClick={() => remove.mutate(h.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {holidays.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
          <p>No public holidays configured</p>
        </div>
      )}
    </div>
  )
}
