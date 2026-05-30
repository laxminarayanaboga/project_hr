import { test, expect } from '../../fixtures/auth.fixture'
import { testEmployee } from '../../utils/test-data'

test.describe('GET /api/v1/employees', () => {
  test('HR Admin can list employees (own company only)', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/employees')

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.content)).toBe(true)
  })

  test('supports pagination params', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/employees?page=0&size=5')

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.content.length).toBeLessThanOrEqual(5)
    expect(body.data).toHaveProperty('totalElements')
    expect(body.data).toHaveProperty('totalPages')
  })

  test('filters by employment status', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/employees?status=ACTIVE')
    expect(res.status()).toBe(200)
    const body = await res.json()
    body.data.content.forEach((emp: { employmentStatus: string }) => {
      expect(emp.employmentStatus).toBe('ACTIVE')
    })
  })
})

test.describe('POST /api/v1/employees', () => {
  test('HR Admin can create an employee', async ({ authedRequest }) => {
    const emp = testEmployee()

    const res = await authedRequest.post('/api/v1/employees', { data: emp })

    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.id).toBeTruthy()
    expect(body.data.firstName).toBe(emp.firstName)
    expect(body.data.lastName).toBe(emp.lastName)
    expect(body.data.employmentStatus).toBe('ACTIVE')
  })

  test('returns 400 when required fields missing', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/v1/employees', {
      data: { firstName: 'No' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
  })
})

test.describe('GET /api/v1/employees/:id', () => {
  test('returns employee detail', async ({ authedRequest }) => {
    const created = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const { data: emp } = await created.json()

    const res = await authedRequest.get(`/api/v1/employees/${emp.id}`)

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(emp.id)
    expect(body.data.firstName).toBe(emp.firstName)
  })

  test('returns 404 for unknown id', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/employees/00000000-0000-0000-0000-000000000000')
    expect(res.status()).toBe(404)
  })
})

test.describe('PUT /api/v1/employees/:id', () => {
  test('HR Admin can update employee fields', async ({ authedRequest }) => {
    const created = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const { data: emp } = await created.json()

    const res = await authedRequest.put(`/api/v1/employees/${emp.id}`, {
      data: { ...emp, jobTitle: 'Senior Engineer' },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.jobTitle).toBe('Senior Engineer')
  })
})

test.describe('DELETE /api/v1/employees/:id (soft delete)', () => {
  test('deactivates employee — sets status to TERMINATED', async ({ authedRequest }) => {
    const created = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const { data: emp } = await created.json()

    const res = await authedRequest.delete(`/api/v1/employees/${emp.id}`, {
      data: { reason: 'Resigned', endDate: '2026-06-01' },
    })

    expect(res.status()).toBe(200)

    // Verify — must still exist but be TERMINATED
    const check = await authedRequest.get(`/api/v1/employees/${emp.id}`)
    const body = await check.json()
    expect(body.data.employmentStatus).toBe('TERMINATED')
  })

  test('terminated employee excluded from default active list', async ({ authedRequest }) => {
    const created = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const { data: emp } = await created.json()
    await authedRequest.delete(`/api/v1/employees/${emp.id}`, {
      data: { reason: 'Resigned', endDate: '2026-06-01' },
    })

    const list = await authedRequest.get('/api/v1/employees?status=ACTIVE')
    const body = await list.json()
    const ids = body.data.content.map((e: { id: string }) => e.id)
    expect(ids).not.toContain(emp.id)
  })
})
