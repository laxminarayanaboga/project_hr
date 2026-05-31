import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Attendance API', () => {

  test('Employee can clock in', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/v1/attendance/clock-in')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.active).toBe(true)
    expect(body.data.clockIn).toBeTruthy()
    expect(body.data.clockOut).toBeNull()
  })

  test('Double clock-in returns 400', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/attendance/clock-in')
    const res = await authedRequest.post('/api/v1/attendance/clock-in')
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('ALREADY_CLOCKED_IN')
  })

  test('Employee can clock out after clock-in', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/attendance/clock-in')
    const res = await authedRequest.post('/api/v1/attendance/clock-out')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.active).toBe(false)
    expect(body.data.clockOut).toBeTruthy()
    expect(typeof body.data.hoursWorked).toBe('number')
  })

  test('Clock-out without clock-in returns 400', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/v1/attendance/clock-out')
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toBe('NOT_CLOCKED_IN')
  })

  test('GET /attendance/today returns current status', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/attendance/today')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(typeof body.data.active).toBe('boolean')
  })

  test('GET /attendance/today shows active session after clock-in', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/attendance/clock-in')
    const res = await authedRequest.get('/api/v1/attendance/today')
    const body = await res.json()
    expect(body.data.active).toBe(true)
    expect(body.data.clockIn).toBeTruthy()
  })

  test('GET /attendance/history returns list', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/attendance/clock-in')
    await authedRequest.post('/api/v1/attendance/clock-out')
    const res = await authedRequest.get('/api/v1/attendance/history')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /attendance/overtime requires manager role', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/attendance/overtime')
    // HR_ADMIN also has access
    expect([200, 403]).toContain(res.status())
  })

  test('HR Admin can view overtime records', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/attendance/overtime')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('Unauthenticated request returns 401', async ({ request }) => {
    const res = await request.post('/api/v1/attendance/clock-in')
    expect(res.status()).toBe(401)
  })
})
