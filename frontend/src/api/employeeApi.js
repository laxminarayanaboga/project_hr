import api from './axios'

export const employeeApi = {
  list: (params) => api.get('/employees', { params }),
  get: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  deactivate: (id, data) => api.delete(`/employees/${id}`, { data }),
  uploadAvatar: (id, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/employees/${id}/avatar`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getDocuments: (id) => api.get(`/employees/${id}/documents`),
}
