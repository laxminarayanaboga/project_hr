import { useQuery } from '@tanstack/react-query'
import { CalendarOff, Calendar, TrendingDown } from 'lucide-react'
import { leaveApi } from '../api/leaveApi'

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon size={18} className="text-blue-600" />
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  )
}

function EmptyRow({ message }) {
  return (
    <p className="px-5 py-6 text-center text-gray-400 text-sm">{message}</p>
  )
}

export default function ManagerDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: () => leaveApi.managerStats().then(r => r.data.data),
  })

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>

  const offToday    = data?.whoIsOffToday    ?? []
  const upcoming    = data?.upcomingLeaves   ?? []
  const absenceStats = data?.absenceStats   ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Leave Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Who's Off Today" icon={CalendarOff}>
          {offToday.length === 0
            ? <EmptyRow message="Everyone is in today" />
            : offToday.map(e => (
              <div key={e.employeeId} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.leaveType}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(e.startDate)} — {formatDate(e.endDate)}
                </span>
              </div>
            ))
          }
        </SectionCard>

        <SectionCard title="Upcoming Leaves (next 30 days)" icon={Calendar}>
          {upcoming.length === 0
            ? <EmptyRow message="No upcoming leaves" />
            : upcoming.map((e, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.leaveType} · {e.workingDays} day{e.workingDays !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(e.startDate)}
                </span>
              </div>
            ))
          }
        </SectionCard>
      </div>

      <SectionCard title="Monthly Absence Rate (this month)" icon={TrendingDown}>
        {absenceStats.length === 0
          ? <EmptyRow message="No team members" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Team Member', 'Days Absent', 'Absence Rate'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {absenceStats.map(s => (
                    <tr key={s.employeeId} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-5 py-3 text-gray-600">{s.daysAbsentThisMonth}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(Number(s.absenceRatePercent), 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-600">{s.absenceRatePercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </SectionCard>
    </div>
  )
}
