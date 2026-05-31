import api from './axios'

export const documentApi = {
  upload: (employeeId, file, type, name, onUploadProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('employeeId', employeeId)
    if (type) form.append('type', type)
    if (name) form.append('name', name)
    return api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
  },
  listByEmployee: (employeeId) => api.get(`/employees/${employeeId}/documents`),
  getDownloadUrl: (id) => api.get(`/documents/${id}/download`),
  delete: (id) => api.delete(`/documents/${id}`),
}
