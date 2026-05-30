import { test, expect } from '../../fixtures/auth.fixture'
import { testDepartment } from '../../utils/test-data'

test.describe('Department API', () => {
  test('HR Admin can create a department', async ({ authedRequest }) => {
    const dept = testDepartment()

    const res = await authedRequest.post('/api/v1/departments', { data: dept })

    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.name).toBe(dept.name)
    expect(body.data.id).toBeTruthy()
  })

  test('can create nested department via parent_id', async ({ authedRequest }) => {
    const parent = await authedRequest.post('/api/v1/departments', {
      data: testDepartment({ name: 'Engineering' }),
    })
    const { data: parentDept } = await parent.json()

    const res = await authedRequest.post('/api/v1/departments', {
      data: testDepartment({ name: 'Frontend', parentId: parentDept.id }),
    })

    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.parentId).toBe(parentDept.id)
  })

  test('can list all departments', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/departments', { data: testDepartment() })

    const res = await authedRequest.get('/api/v1/departments')

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('org chart returns nested tree structure', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/departments/org-chart')

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    if (body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('children')
    }
  })

  test('returns 400 when deleting department with active employees', async ({ authedRequest }) => {
    const dept = await authedRequest.post('/api/v1/departments', { data: testDepartment() })
    const { data: deptData } = await dept.json()

    await authedRequest.post('/api/v1/employees', {
      data: { firstName: 'A', lastName: 'B', startDate: '2026-01-01', departmentId: deptData.id },
    })

    const res = await authedRequest.delete(`/api/v1/departments/${deptData.id}`)
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})
