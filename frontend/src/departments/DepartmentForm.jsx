import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Department name is required').max(255),
  description: z.string().max(500).optional().or(z.literal('')),
  parentId: z.union([z.string().uuid(), z.literal('')]).nullable().optional(),
})

function Field({ label, children, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function DepartmentForm({ initialValues, departments, editingId, onSubmit, onCancel, isSubmitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      parentId: initialValues?.parentId ?? '',
    },
  })

  useEffect(() => {
    reset({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      parentId: initialValues?.parentId ?? '',
    })
  }, [initialValues, reset])

  const submit = (data) => {
    onSubmit({
      name: data.name,
      description: data.description || null,
      parentId: data.parentId || null,
    })
  }

  const parentOptions = departments?.filter(d => d.id !== editingId) ?? []

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Field label="Department Name *" error={errors.name?.message}>
        <input
          {...register('name')}
          placeholder="e.g. Engineering"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <input
          {...register('description')}
          placeholder="Optional"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Parent Department" error={errors.parentId?.message}>
        <select
          {...register('parentId')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">None (top-level)</option>
          {parentOptions.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {isSubmitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create Department'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
