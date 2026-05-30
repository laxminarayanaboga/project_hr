import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { departmentApi } from '../api/departmentApi'

function DeptNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children?.length > 0

  return (
    <div className={depth > 0 ? 'ml-8 mt-2' : ''}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(e => !e)}
          className={`p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors ${!hasChildren ? 'invisible' : ''}`}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <Link
          to="/departments"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <span className="font-medium text-gray-900 text-sm">{node.name}</span>
          {node.description && (
            <span className="text-xs text-gray-400 hidden sm:inline">— {node.description}</span>
          )}
          {node.employeeCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400 ml-1">
              <Users size={12} />
              {node.employeeCount}
            </span>
          )}
        </Link>
      </div>

      {expanded && hasChildren && (
        <div className="mt-2 border-l-2 border-gray-100 pl-2">
          {node.children.map(child => (
            <DeptNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => departmentApi.orgChart().then(r => r.data.data),
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Org Chart</h1>
        <p className="text-sm text-gray-500 mt-1">Company structure — click any department to manage it</p>
      </div>

      {isLoading && (
        <p className="text-gray-400 text-sm">Loading…</p>
      )}

      {isError && (
        <p className="text-red-500 text-sm">Failed to load org chart.</p>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No departments yet.</p>
          <Link to="/departments" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
            Add a department
          </Link>
        </div>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="space-y-2">
          {data.map(node => <DeptNode key={node.id} node={node} />)}
        </div>
      )}
    </div>
  )
}
