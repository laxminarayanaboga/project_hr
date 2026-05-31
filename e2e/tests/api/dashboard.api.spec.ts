import { test, expect } from '../../fixtures/auth.fixture'
import { testEmployee } from '../../utils/test-data'

test.describe('GET /api/v1/company/stats', () => {
  test('returns stats for authenticated HR Admin', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/company/stats')

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(typeof body.data.totalEmployees).toBe('number')
    expect(typeof body.data.activeEmployees).toBe('number')
    expect(typeof body.data.totalDepartments).toBe('number')
    expect(typeof body.data.newHiresThisMonth).toBe('number')
    expect(Array.isArray(body.data.recentHires)).toBe(true)
  })

  test('stats reflect created employees', async ({ authedRequest }) => {
    // Get baseline
    const before = (await authedRequest.get('/api/v1/company/stats').then(r => r.json())).data

    // Create an employee
    await authedRequest.post('/api/v1/employees', { data: testEmployee() })

    const after = (await authedRequest.get('/api/v1/company/stats').then(r => r.json())).data

    expect(after.totalEmployees).toBeGreaterThan(before.totalEmployees)
    expect(after.activeEmployees).toBeGreaterThan(before.activeEmployees)
  })

  test('recent hires list has expected fields', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/employees', { data: testEmployee({ firstName: 'Stats', lastName: 'Hire' }) })

    const res = await authedRequest.get('/api/v1/company/stats')
    const { recentHires } = (await res.json()).data

    if (recentHires.length > 0) {
      const hire = recentHires[0]
      expect(hire).toHaveProperty('id')
      expect(hire).toHaveProperty('firstName')
      expect(hire).toHaveProperty('lastName')
    }
  })

  test('returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${process.env.API_URL || 'http://localhost:8080'}/api/v1/company/stats`)
    expect(res.status()).toBe(401)
  })
})
