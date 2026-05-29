import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentApi } from '../api/departmentApi'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function DepartmentListPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const { data } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.list().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: () => departmentApi.create({ name }),
    onSuccess: () => { qc.invalidateQueries(['departments']); setName(''); setShowForm(false) },
  })

  const remove = useMutation({
    mutationFn: (id) => departmentApi.delete(id),
    onSuccess: () => qc.invalidateQueries(['departments']),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      {showForm && (
        <div className="mb-4 flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Department name"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <button
            onClick={() => create.mutate()}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40"
          >
            Save
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {data?.map(dept => (
          <div key={dept.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{dept.name}</p>
              {dept.description && <p className="text-sm text-gray-500">{dept.description}</p>}
            </div>
            <button
              onClick={() => remove.mutate(dept.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {data?.length === 0 && (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">No departments yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
