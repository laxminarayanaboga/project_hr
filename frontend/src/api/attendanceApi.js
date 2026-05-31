import api from './axios'

export const attendanceApi = {
  clockIn:        ()            => api.post('/attendance/clock-in'),
  clockOut:       ()            => api.post('/attendance/clock-out'),
  today:          ()            => api.get('/attendance/today'),
  history:        (page = 0, size = 20) => api.get('/attendance/history', { params: { page, size } }),
  teamOvertime:   (teamId)      => api.get('/attendance/overtime', { params: teamId ? { teamId } : {} }),
  approveOvertime: (id, action) => api.put(`/attendance/overtime/${id}/approve`, { action }),
}
