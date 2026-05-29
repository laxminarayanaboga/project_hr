import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, GitBranch, FileText } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { to: '/employees', icon: Users, label: 'Employees', roles: ['HR_ADMIN', 'MANAGER'] },
  { to: '/departments', icon: Building2, label: 'Departments', roles: ['HR_ADMIN', 'MANAGER'] },
  { to: '/org-chart', icon: GitBranch, label: 'Org Chart', roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
]

export default function Sidebar() {
  const { user } = useAuth()

  const visible = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">HRApp</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visible.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        <p className="text-xs text-gray-400">{user?.role?.replace('_', ' ')}</p>
      </div>
    </div>
  )
}
