import { useQuery } from '@tanstack/react-query'
import { departmentApi } from '../api/departmentApi'

function DeptNode({ node, depth = 0 }) {
  return (
    <div className={depth > 0 ? 'ml-8 mt-2' : ''}>
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg w-fit">
        <span className="font-medium text-gray-900 text-sm">{node.name}</span>
        {node.employeeCount > 0 && (
          <span className="text-xs text-gray-400">{node.employeeCount} people</span>
        )}
      </div>
      {node.children?.map(child => (
        <DeptNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function OrgChartPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => departmentApi.orgChart().then(r => r.data.data),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Org Chart</h1>
      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <div className="space-y-2">
          {data?.map(node => <DeptNode key={node.id} node={node} />)}
        </div>
      )}
    </div>
  )
}
