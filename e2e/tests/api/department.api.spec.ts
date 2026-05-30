import { test, expect } from '@playwright/test'
import { testCompany, testDepartment } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(request: any, suffix: string) {
  const company = testCompany(suffix)
  const res = await request.post(`${API}/auth/register`, { data: company })
  const body = await res.json()
  return { accessToken: body.data.accessToken, company }
}

async function createDepartment(request: any, token: string, data = testDepartment()) {
  const res = await request.post(`${API}/departments`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  return res
}

test.describe('GET /departments', () => {
  test('returns empty list for new company', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-list-empty')

    const res = await request.get(`${API}/departments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  test('returns departments for the current company only', async ({ request }) => {
    const { accessToken: tokenA } = await registerAndLogin(request, 'dept-list-a')
    const { accessToken: tokenB } = await registerAndLogin(request, 'dept-list-b')

    await createDepartment(request, tokenA, testDepartment({ name: 'Company A Dept' }))

    const resB = await request.get(`${API}/departments`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    const bodyB = await resB.json()
    expect(bodyB.data).toEqual([])
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${API}/departments`)
    expect(res.status()).toBe(401)
  })
})

test.describe('POST /departments', () => {
  test('creates department with name and description', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-create')

    const res = await createDepartment(request, accessToken)

    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.name).toBe('Engineering')
    expect(body.data.description).toBe('Software development team')
    expect(body.data.parentId).toBeNull()
  })

  test('creates nested department with parent', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-nested')

    const parentRes = await createDepartment(request, accessToken, testDepartment({ name: 'Tech' }))
    const parentId = (await parentRes.json()).data.id

    const childRes = await createDepartment(request, accessToken, testDepartment({ name: 'Frontend', parentId }))
    const child = (await childRes.json()).data

    expect(child.parentId).toBe(parentId)
    expect(child.parentName).toBe('Tech')
  })

  test('returns 400 when name is blank', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-create-blank')

    const res = await request.post(`${API}/departments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: '' },
    })

    expect(res.status()).toBe(400)
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${API}/departments`, { data: testDepartment() })
    expect(res.status()).toBe(401)
  })
})

test.describe('PUT /departments/:id', () => {
  test('updates department name and description', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-update')

    const createRes = await createDepartment(request, accessToken)
    const deptId = (await createRes.json()).data.id

    const updateRes = await request.put(`${API}/departments/${deptId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'R&D', description: 'Research' },
    })

    expect(updateRes.status()).toBe(200)
    const body = await updateRes.json()
    expect(body.data.name).toBe('R&D')
    expect(body.data.description).toBe('Research')
  })

  test('returns 404 for unknown department', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-update-404')
    const fakeId = '00000000-0000-0000-0000-000000000000'

    const res = await request.put(`${API}/departments/${fakeId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'X' },
    })

    expect(res.status()).toBe(404)
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.put(`${API}/departments/some-id`, { data: { name: 'X' } })
    expect(res.status()).toBe(401)
  })
})

test.describe('DELETE /departments/:id', () => {
  test('deletes department with no employees', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-delete')

    const createRes = await createDepartment(request, accessToken)
    const deptId = (await createRes.json()).data.id

    const deleteRes = await request.delete(`${API}/departments/${deptId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(deleteRes.status()).toBe(200)

    const listRes = await request.get(`${API}/departments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const list = (await listRes.json()).data
    expect(list.find((d: any) => d.id === deptId)).toBeUndefined()
  })

  test('returns 404 for unknown department', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'dept-delete-404')
    const fakeId = '00000000-0000-0000-0000-000000000000'

    const res = await request.delete(`${API}/departments/${fakeId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(res.status()).toBe(404)
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.delete(`${API}/departments/some-id`)
    expect(res.status()).toBe(401)
  })
})
