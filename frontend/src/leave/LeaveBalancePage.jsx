import { useQuery } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { leaveApi } from '../api/leaveApi'

export default function LeaveBalancePage() {
  const { data: balances = [], isLoading } = useQuery({
    queryKey: ['my-balances'],
    queryFn: () => leaveApi.myBalances().then(r => r.data.data),
  })

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Leave Balances</h1>

      {balances.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Wallet size={40} className="mx-auto mb-3 opacity-30" />
          <p>No leave balances found. Contact HR to set up your leave entitlement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map(b => {
            const pct = b.entitledDays + b.adjustedDays > 0
              ? Math.round((b.usedDays / (b.entitledDays + b.adjustedDays)) * 100)
              : 0
            return (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{b.leaveTypeName}</p>
                    <p className="text-xs text-gray-400">{b.year}</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{b.remainingDays}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{b.usedDays} days used</span>
                  <span>{Number(b.entitledDays) + Number(b.adjustedDays)} days total</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
