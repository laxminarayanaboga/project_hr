import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { departmentApi } from '../api/departmentApi'
import DepartmentForm from './DepartmentForm'

export default function DepartmentListPage() {
  const qc = useQueryClient()
  const [panel, setPanel] = useState(null) // null | { mode: 'create' } | { mode: 'edit', dept }

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.list().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: (data) => departmentApi.create(data),
    onSuccess: () => { qc.invalidateQueries(['departments']); setPanel(null) },
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => departmentApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['departments']); setPanel(null) },
  })

  const remove = useMutation({
    mutationFn: (id) => departmentApi.delete(id),
    onSuccess: () => qc.invalidateQueries(['departments']),
  })

  const handleSubmit = (data) => {
    if (panel?.mode === 'edit') {
      update.mutate({ id: panel.dept.id, data })
    } else {
      create.mutate(data)
    }
  }

  const handleDelete = (dept) => {
    if (window.confirm(`Delete "${dept.name}"? This cannot be undone.`)) {
      remove.mutate(dept.id)
    }
  }

  const isSubmitting = create.isPending || update.isPending
  const error = create.error || update.error || remove.error

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button
          onClick={() => setPanel({ mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error.response?.data?.message ?? 'Something went wrong'}
        </div>
      )}

      {panel && (
        <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {panel.mode === 'edit' ? `Edit — ${panel.dept.name}` : 'New Department'}
          </h2>
          <DepartmentForm
            initialValues={panel.mode === 'edit' ? panel.dept : null}
            departments={departments}
            editingId={panel.mode === 'edit' ? panel.dept.id : null}
            onSubmit={handleSubmit}
            onCancel={() => setPanel(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {isLoading && (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">Loading…</p>
        )}
        {!isLoading && departments.length === 0 && (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">
            No departments yet. Add one above.
          </p>
        )}
        {departments.map(dept => (
          <div key={dept.id} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {dept.parentName && (
                  <>
                    <span className="text-sm text-gray-400">{dept.parentName}</span>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </>
                )}
                <p className="font-medium text-gray-900 truncate">{dept.name}</p>
              </div>
              {dept.description && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">{dept.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setPanel({ mode: 'edit', dept })}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(dept)}
                disabled={remove.isPending}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded disabled:opacity-40"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
