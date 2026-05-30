import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../api/employeeApi'
import { departmentApi } from '../api/departmentApi'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  nationality: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  personalEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  employeeNumber: z.string().optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', '']).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  probationEnd: z.string().optional().or(z.literal('')),
  departmentId: z.string().uuid().optional().or(z.literal('')),
  managerId: z.string().uuid().optional().or(z.literal('')),
})

function Field({ label, required, children, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}

function Select({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
    >
      {children}
    </select>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-base font-semibold text-gray-900 mb-4">{children}</h2>
}

export default function EmployeeFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existingEmployee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.get(id).then(r => r.data.data),
    enabled: isEdit,
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.list().then(r => r.data.data),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees-all'],
    queryFn: () => employeeApi.list({ status: 'ACTIVE', size: 200 }).then(r => r.data.data?.content ?? []),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults(),
  })

  useEffect(() => {
    if (existingEmployee) {
      reset({
        firstName: existingEmployee.firstName ?? '',
        lastName: existingEmployee.lastName ?? '',
        preferredName: existingEmployee.preferredName ?? '',
        dateOfBirth: existingEmployee.dateOfBirth ?? '',
        gender: existingEmployee.gender ?? '',
        nationality: existingEmployee.nationality ?? '',
        phone: existingEmployee.phone ?? '',
        personalEmail: existingEmployee.personalEmail ?? '',
        address: existingEmployee.address ?? '',
        employeeNumber: existingEmployee.employeeNumber ?? '',
        jobTitle: existingEmployee.jobTitle ?? '',
        employmentType: existingEmployee.employmentType ?? '',
        startDate: existingEmployee.startDate ?? '',
        endDate: existingEmployee.endDate ?? '',
        probationEnd: existingEmployee.probationEnd ?? '',
        departmentId: existingEmployee.departmentId ?? '',
        managerId: existingEmployee.managerId ?? '',
      })
    }
  }, [existingEmployee, reset])

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = toPayload(data)
      return isEdit
        ? employeeApi.update(id, payload)
        : employeeApi.create(payload)
    },
    onSuccess: (res) => {
      const empId = res.data.data.id
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', empId] })
      navigate(`/employees/${empId}`)
    },
  })

  if (isEdit && loadingEmployee) {
    return <div className="text-gray-400 text-sm p-8">Loading…</div>
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(isEdit ? `/employees/${id}` : '/employees')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Employee' : 'Add Employee'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-8">
        {mutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {mutation.error?.response?.data?.message ?? 'Something went wrong. Please try again.'}
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required error={errors.firstName?.message}>
              <Input {...register('firstName')} placeholder="Jane" />
            </Field>
            <Field label="Last Name" required error={errors.lastName?.message}>
              <Input {...register('lastName')} placeholder="Smith" />
            </Field>
            <Field label="Preferred Name" error={errors.preferredName?.message}>
              <Input {...register('preferredName')} placeholder="Optional" />
            </Field>
            <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
              <Input {...register('dateOfBirth')} type="date" />
            </Field>
            <Field label="Gender" error={errors.gender?.message}>
              <Select {...register('gender')}>
                <option value="">— Select —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Select>
            </Field>
            <Field label="Nationality" error={errors.nationality?.message}>
              <Input {...register('nationality')} placeholder="e.g. British" />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} placeholder="+44 7700 900000" />
            </Field>
            <Field label="Personal Email" error={errors.personalEmail?.message}>
              <Input {...register('personalEmail')} type="email" placeholder="jane@example.com" />
            </Field>
            <Field label="Address" error={errors.address?.message} className="sm:col-span-2">
              <Input {...register('address')} placeholder="123 High Street, London" />
            </Field>
          </div>
        </div>

        {/* Job Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionTitle>Job Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Employee Number" error={errors.employeeNumber?.message}>
              <Input {...register('employeeNumber')} placeholder="Auto-generated if blank" />
            </Field>
            <Field label="Job Title" error={errors.jobTitle?.message}>
              <Input {...register('jobTitle')} placeholder="e.g. Software Engineer" />
            </Field>
            <Field label="Employment Type" error={errors.employmentType?.message}>
              <Select {...register('employmentType')}>
                <option value="">— Select —</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </Select>
            </Field>
            <Field label="Department" error={errors.departmentId?.message}>
              <Select {...register('departmentId')}>
                <option value="">— None —</option>
                {departments?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Manager" error={errors.managerId?.message}>
              <Select {...register('managerId')}>
                <option value="">— None —</option>
                {employees?.filter(e => e.id !== id).map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </Select>
            </Field>
            <Field label="Start Date" required error={errors.startDate?.message}>
              <Input {...register('startDate')} type="date" />
            </Field>
            <Field label="End Date" error={errors.endDate?.message}>
              <Input {...register('endDate')} type="date" />
            </Field>
            <Field label="Probation End Date" error={errors.probationEnd?.message}>
              <Input {...register('probationEnd')} type="date" />
            </Field>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
          </button>
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/employees/${id}` : '/employees')}
            className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function emptyDefaults() {
  return {
    firstName: '', lastName: '', preferredName: '',
    dateOfBirth: '', gender: '', nationality: '',
    phone: '', personalEmail: '', address: '',
    employeeNumber: '', jobTitle: '', employmentType: '',
    startDate: '', endDate: '', probationEnd: '',
    departmentId: '', managerId: '',
  }
}

function toPayload(data) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    preferredName: data.preferredName || null,
    dateOfBirth: data.dateOfBirth || null,
    gender: data.gender || null,
    nationality: data.nationality || null,
    phone: data.phone || null,
    personalEmail: data.personalEmail || null,
    address: data.address || null,
    employeeNumber: data.employeeNumber || null,
    jobTitle: data.jobTitle || null,
    employmentType: data.employmentType || null,
    startDate: data.startDate,
    endDate: data.endDate || null,
    probationEnd: data.probationEnd || null,
    departmentId: data.departmentId || null,
    managerId: data.managerId || null,
  }
}
