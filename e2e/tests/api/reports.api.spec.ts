import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Leave Reports API', () => {
  test('GET /reports/leave returns 200 with valid date range', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/reports/leave', {
      params: { from: '2026-01-01', to: '2026-12-31' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.rows)).toBe(true)
    expect(typeof body.data.grandTotal).toBe('number')
    expect(typeof body.data.totalsByLeaveType).toBe('object')
  })

  test('GET /reports/leave returns empty rows when no leaves exist', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/reports/leave', {
      params: { from: '2025-01-01', to: '2025-01-31' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.rows).toHaveLength(0)
    expect(body.data.grandTotal).toBe(0)
  })

  test('GET /reports/leave returns 400 when from is missing', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/reports/leave', {
      params: { to: '2026-12-31' },
    })
    expect(res.status()).toBe(400)
  })

  test('GET /reports/leave returns 400 when to is missing', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/reports/leave', {
      params: { from: '2026-01-01' },
    })
    expect(res.status()).toBe(400)
  })

  test('GET /reports/leave/export?format=csv returns CSV file', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/reports/leave/export', {
      params: { from: '2026-01-01', to: '2026-12-31', format: 'csv' },
    })
    expect(res.status()).toBe(200)
    const disposition = res.headers()['content-disposition']
    expect(disposition).toContain('leave-report.csv')
    const text = await res.text()
    expect(text).toContain('Employee')
  })

  test('GET /reports/leave/export?format=pdf returns PDF bytes', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/reports/leave/export', {
      params: { from: '2026-01-01', to: '2026-12-31', format: 'pdf' },
    })
    expect(res.status()).toBe(200)
    const disposition = res.headers()['content-disposition']
    expect(disposition).toContain('leave-report.pdf')
    const body = await res.body()
    expect(body.length).toBeGreaterThan(0)
  })

  test('GET /reports/leave returns 401 without auth', async ({ request }) => {
    const API = process.env.API_URL || 'http://localhost:8080'
    const res = await request.get(`${API}/api/v1/reports/leave`, {
      params: { from: '2026-01-01', to: '2026-12-31' },
    })
    expect(res.status()).toBe(401)
  })
})
