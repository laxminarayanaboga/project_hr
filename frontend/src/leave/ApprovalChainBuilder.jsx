import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { leaveApi } from '../api/leaveApi'

const APPROVER_LABELS = { DIRECT_MANAGER: 'Direct Manager', HR_ADMIN: 'HR Admin' }

export default function ApprovalChainBuilder({ leaveTypeId }) {
  const qc = useQueryClient()

  const { data: chain = [], isLoading } = useQuery({
    queryKey: ['approval-chain', leaveTypeId],
    queryFn: () => leaveApi.getApprovalChain(leaveTypeId).then(r => r.data.data),
  })

  const [steps, setSteps] = useState([])

  useEffect(() => {
    if (chain.length > 0) setSteps(chain.map(s => s.approverType))
  }, [chain])

  const save = useMutation({
    mutationFn: (data) => leaveApi.setApprovalChain(leaveTypeId, data),
    onSuccess: () => qc.invalidateQueries(['approval-chain', leaveTypeId]),
  })

  function addStep() {
    if (steps.length >= 3) return
    setSteps([...steps, 'DIRECT_MANAGER'])
  }

  function updateStep(i, val) {
    const next = [...steps]
    next[i] = val
    setSteps(next)
  }

  function removeStep(i) {
    setSteps(steps.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    const payload = steps.map((approverType, i) => ({ stepOrder: i + 1, approverType }))
    save.mutate(payload)
  }

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Configure up to 3 sequential approval levels for this leave type.</p>

      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-16">Step {i + 1}</span>
          <select value={step} onChange={(e) => updateStep(i, e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            {Object.entries(APPROVER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={() => removeStep(i)} className="text-red-500 hover:text-red-700">
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {steps.length === 0 && (
        <p className="text-sm text-gray-400 italic">No steps configured — leave type uses default single-manager approval.</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        {steps.length < 3 && (
          <button onClick={addStep}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <Plus size={15} /> Add step
          </button>
        )}
        <button onClick={handleSave} disabled={save.isPending}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {save.isPending ? 'Saving…' : 'Save chain'}
        </button>
      </div>

      {save.isSuccess && <p className="text-sm text-green-600">Approval chain saved.</p>}
      {save.isError && <p className="text-sm text-red-600">Failed to save. Please try again.</p>}
    </div>
  )
}
