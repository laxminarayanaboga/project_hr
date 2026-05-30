import { test, expect } from '@playwright/test'
import { testCompany, testDepartment } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(request: any, suffix: string) {
  const company = testCompany(suffix)
  const res = await request.post(`${API}/auth/register`, { data: company })
  const body = await res.json()
  return { accessToken: body.data.accessToken, company }
}

async function createDept(request: any, token: string, data: object) {
  const res = await request.post(`${API}/departments`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  return (await res.json()).data
}

test.describe('GET /departments/org-chart', () => {
  test('returns empty list for new company', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'oc-empty')

    const res = await request.get(`${API}/departments/org-chart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  test('returns flat list of root departments with no children', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'oc-flat')

    await createDept(request, accessToken, testDepartment({ name: 'Engineering' }))
    await createDept(request, accessToken, testDepartment({ name: 'Marketing' }))

    const res = await request.get(`${API}/departments/org-chart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const body = await res.json()
    expect(body.data).toHaveLength(2)
    const names = body.data.map((n: any) => n.name)
    expect(names).toContain('Engineering')
    expect(names).toContain('Marketing')
    body.data.forEach((node: any) => {
      expect(node.children).toEqual([])
    })
  })

  test('returns nested tree when child departments exist', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'oc-nested')

    const parent = await createDept(request, accessToken, testDepartment({ name: 'Tech' }))
    await createDept(request, accessToken, testDepartment({ name: 'Frontend', parentId: parent.id }))
    await createDept(request, accessToken, testDepartment({ name: 'Backend', parentId: parent.id }))

    const res = await request.get(`${API}/departments/org-chart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const body = await res.json()
    expect(body.data).toHaveLength(1)
    const root = body.data[0]
    expect(root.name).toBe('Tech')
    expect(root.children).toHaveLength(2)
    const childNames = root.children.map((c: any) => c.name)
    expect(childNames).toContain('Frontend')
    expect(childNames).toContain('Backend')
  })

  test('each node has required fields', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'oc-fields')

    await createDept(request, accessToken, testDepartment({ name: 'Ops' }))

    const res = await request.get(`${API}/departments/org-chart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const body = await res.json()
    const node = body.data[0]
    expect(node).toHaveProperty('id')
    expect(node).toHaveProperty('name')
    expect(node).toHaveProperty('employeeCount')
    expect(node).toHaveProperty('children')
    expect(typeof node.employeeCount).toBe('number')
  })

  test('employee count is zero when no employees in department', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'oc-count-zero')

    await createDept(request, accessToken, testDepartment({ name: 'Empty Dept' }))

    const res = await request.get(`${API}/departments/org-chart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const body = await res.json()
    expect(body.data[0].employeeCount).toBe(0)
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${API}/departments/org-chart`)
    expect(res.status()).toBe(401)
  })

  test('isolates data between companies', async ({ request }) => {
    const { accessToken: tokenA } = await registerAndLogin(request, 'oc-iso-a')
    const { accessToken: tokenB } = await registerAndLogin(request, 'oc-iso-b')

    await createDept(request, tokenA, testDepartment({ name: 'Company A Dept' }))

    const res = await request.get(`${API}/departments/org-chart`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })

    const body = await res.json()
    expect(body.data).toEqual([])
  })
})
