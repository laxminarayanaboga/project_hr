import { useQuery } from '@tanstack/react-query'
import { Users, Building2, UserCheck, UserX } from 'lucide-react'
import api from '../api/axios'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['company-stats'],
    queryFn: () => api.get('/company/stats').then(r => r.data.data),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={data?.totalEmployees} color="bg-blue-500" />
        <StatCard icon={UserCheck} label="Active" value={data?.activeEmployees} color="bg-green-500" />
        <StatCard icon={Building2} label="Departments" value={data?.totalDepartments} color="bg-purple-500" />
        <StatCard icon={UserX} label="New This Month" value={data?.newHiresThisMonth} color="bg-orange-500" />
      </div>

      {data?.recentHires?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Hires</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {data.recentHires.map((emp) => (
              <div key={emp.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-gray-500">{emp.jobTitle} · {emp.departmentName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
