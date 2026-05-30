import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { companyApi } from '../api/companyApi'
import { useAuth } from '../auth/useAuth'

const schema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
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

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  )
}

export default function CompanySettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'HR_ADMIN'

  const { data: profile, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => companyApi.getProfile().then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) reset(profile)
  }, [profile, reset])

  const updateMutation = useMutation({
    mutationFn: companyApi.updateProfile,
    onSuccess: (res) => {
      queryClient.setQueryData(['company-profile'], res.data.data)
      reset(res.data.data)
      setSaveMessage('Changes saved.')
      setTimeout(() => setSaveMessage(''), 3000)
    },
    onError: (err) => setSaveError(err.response?.data?.message || 'Save failed'),
  })

  const logoMutation = useMutation({
    mutationFn: companyApi.uploadLogo,
    onSuccess: (res) => {
      queryClient.setQueryData(['company-profile'], res.data.data)
    },
    onError: (err) => setLogoError(err.response?.data?.message || 'Upload failed'),
  })

  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [logoError, setLogoError] = useState('')
  const [logoPreview, setLogoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const onSubmit = (values) => {
    setSaveError('')
    updateMutation.mutate(values)
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError('')
    setLogoPreview(URL.createObjectURL(file))
    logoMutation.mutate(file)
  }

  const logoSrc = logoPreview || profile?.logoUrl

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading company profile…
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Settings</h1>

      {/* Logo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Company Logo</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {logoSrc
              ? <img src={logoSrc} alt="Company logo" className="w-full h-full object-contain" />
              : <Building2 size={28} className="text-gray-400" />
            }
          </div>
          {isAdmin && (
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={logoMutation.isPending}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {logoMutation.isPending ? 'Uploading…' : 'Upload logo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
                data-testid="logo-file-input"
              />
              {logoError && <p className="mt-1 text-xs text-red-600">{logoError}</p>}
              <p className="mt-1 text-xs text-gray-400">PNG, JPG, SVG — max 5 MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Company Details</h2>

        {isAdmin ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Field label="Company name *" error={errors.name?.message}>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+44 20 7946 0958"
              />
            </Field>

            <Field label="Address" error={errors.address?.message}>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </Field>

            <Field label="Country" error={errors.country?.message}>
              <input
                {...register('country')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            {saveMessage && <p className="text-sm text-green-600">{saveMessage}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </button>
              {isDirty && (
                <button
                  type="button"
                  onClick={() => reset(profile)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <ReadOnlyField label="Company name" value={profile?.name} />
            <ReadOnlyField label="Phone" value={profile?.phone} />
            <ReadOnlyField label="Address" value={profile?.address} />
            <ReadOnlyField label="Country" value={profile?.country} />
          </div>
        )}
      </div>
    </div>
  )
}
