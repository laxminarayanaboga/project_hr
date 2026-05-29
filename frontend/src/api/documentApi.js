import api from './axios'

export const documentApi = {
  upload: (employeeId, file, type, name) => {
    const form = new FormData()
    form.append('file', file)
    form.append('employeeId', employeeId)
    form.append('type', type)
    form.append('name', name)
    return api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getDownloadUrl: (id) => api.get(`/documents/${id}/download`),
  delete: (id) => api.delete(`/documents/${id}`),
}
