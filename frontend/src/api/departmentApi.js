import api from './axios'

export const departmentApi = {
  list: () => api.get('/departments'),
  orgChart: () => api.get('/departments/org-chart'),
  get: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
}
