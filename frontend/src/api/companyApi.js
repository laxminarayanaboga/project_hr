import api from './axios'

export const companyApi = {
  getProfile: () => api.get('/company'),
  updateProfile: (data) => api.put('/company', data),
  uploadLogo: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/company/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
