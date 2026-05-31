import api from './axios'

export const leaveApi = {
  // Leave Types
  listLeaveTypes: () => api.get('/leave-types'),
  createLeaveType: (data) => api.post('/leave-types', data),
  updateLeaveType: (id, data) => api.put(`/leave-types/${id}`, data),
  deactivateLeaveType: (id) => api.delete(`/leave-types/${id}`),

  // Approval chains
  getApprovalChain: (leaveTypeId) => api.get(`/leave-types/${leaveTypeId}/approval-chain`),
  setApprovalChain: (leaveTypeId, steps) => api.put(`/leave-types/${leaveTypeId}/approval-chain`, steps),

  // Public Holidays
  listHolidays: () => api.get('/public-holidays'),
  createHoliday: (data) => api.post('/public-holidays', data),
  deleteHoliday: (id) => api.delete(`/public-holidays/${id}`),

  // Leave Requests
  submitLeave: (data) => api.post('/leaves', data),
  myRequests: () => api.get('/leaves/my'),
  pendingRequests: () => api.get('/leaves/pending'),
  teamCalendar: (from, to) => api.get('/leaves/team', { params: { from, to } }),
  approveLeave: (id, data) => api.put(`/leaves/${id}/approve`, data),
  rejectLeave: (id, data) => api.put(`/leaves/${id}/reject`, data),
  overrideApprove: (id) => api.post(`/leaves/${id}/override`),
  cancelLeave: (id) => api.delete(`/leaves/${id}`),

  // Leave Balances
  myBalances: () => api.get('/leave-balances/me'),
  balancesForEmployee: (employeeId) => api.get('/leave-balances', { params: { employeeId } }),
  adjustBalance: (id, data) => api.put(`/leave-balances/${id}/adjust`, data),
}
