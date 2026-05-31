import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Manager Dashboard API', () => {
  test('GET /dashboard/manager-stats returns 200 for HR Admin', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/dashboard/manager-stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.whoIsOffToday)).toBe(true)
    expect(Array.isArray(body.data.upcomingLeaves)).toBe(true)
    expect(Array.isArray(body.data.absenceStats)).toBe(true)
  })

  test('returns empty lists when no team members', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/dashboard/manager-stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    // Fresh company has no employees yet
    expect(body.data.whoIsOffToday).toHaveLength(0)
    expect(body.data.upcomingLeaves).toHaveLength(0)
  })

  test('absence stats include employees after they are created', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/employees', {
      data: { firstName: 'Team', lastName: 'Member', jobTitle: 'Engineer', employmentType: 'FULL_TIME', startDate: '2026-01-01' },
    })

    const res = await authedRequest.get('/api/v1/dashboard/manager-stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.absenceStats.length).toBeGreaterThanOrEqual(1)
    const stat = body.data.absenceStats.find((s: any) => s.name === 'Team Member')
    expect(stat).toBeDefined()
    expect(stat.daysAbsentThisMonth).toBe(0)
  })

  test('returns 401 without auth', async ({ request }) => {
    const API = process.env.API_URL || 'http://localhost:8080'
    const res = await request.get(`${API}/api/v1/dashboard/manager-stats`)
    expect(res.status()).toBe(401)
  })
})
