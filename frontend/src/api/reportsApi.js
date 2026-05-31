import api from './axios'

export const reportsApi = {
  getLeaveReport: (params) => api.get('/reports/leave', { params }),
  exportLeave: (params) =>
    api.get('/reports/leave/export', { params, responseType: 'blob' }),
}
