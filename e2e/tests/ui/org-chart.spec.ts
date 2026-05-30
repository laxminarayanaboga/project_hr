import { test, expect } from '@playwright/test'
import { testCompany, testDepartment } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function loginAs(page: any, request: any, suffix: string) {
  const company = testCompany(suffix)
  await request.post(`${API}/auth/register`, { data: company })

  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(company.email)
  await page.locator('input[type="password"]').fill(company.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
  return company
}

async function createDeptViaApi(request: any, token: string, data: object) {
  const res = await request.post(`${API}/departments`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  return (await res.json()).data
}

async function loginAndGetToken(request: any, suffix: string) {
  const company = testCompany(suffix)
  const res = await request.post(`${API}/auth/register`, { data: company })
  const body = await res.json()
  return { accessToken: body.data.accessToken, company }
}

test.describe('Org Chart Page', () => {
  test('shows empty state when no departments exist', async ({ page, request }) => {
    await loginAs(page, request, 'oc-ui-empty')

    await page.goto('/org-chart')

    await expect(page.getByRole('heading', { name: /org chart/i })).toBeVisible()
    await expect(page.getByText(/no departments yet/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /add a department/i })).toBeVisible()
  })

  test('renders department nodes after departments are created', async ({ page, request }) => {
    const { accessToken, company } = await loginAndGetToken(request, 'oc-ui-nodes')

    await createDeptViaApi(request, accessToken, testDepartment({ name: 'Engineering' }))
    await createDeptViaApi(request, accessToken, testDepartment({ name: 'Marketing' }))

    await page.goto('/login')
    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/)

    await page.goto('/org-chart')

    await expect(page.getByText('Engineering')).toBeVisible()
    await expect(page.getByText('Marketing')).toBeVisible()
  })

  test('renders child nodes nested under parent', async ({ page, request }) => {
    const { accessToken, company } = await loginAndGetToken(request, 'oc-ui-nested')

    const parent = await createDeptViaApi(request, accessToken, testDepartment({ name: 'Tech' }))
    await createDeptViaApi(request, accessToken, testDepartment({ name: 'Frontend', parentId: parent.id }))

    await page.goto('/login')
    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/)

    await page.goto('/org-chart')

    await expect(page.getByText('Tech')).toBeVisible()
    await expect(page.getByText('Frontend')).toBeVisible()
  })

  test('can collapse and expand a department node', async ({ page, request }) => {
    const { accessToken, company } = await loginAndGetToken(request, 'oc-ui-toggle')

    const parent = await createDeptViaApi(request, accessToken, testDepartment({ name: 'Engineering' }))
    await createDeptViaApi(request, accessToken, testDepartment({ name: 'Backend', parentId: parent.id }))

    await page.goto('/login')
    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/)

    await page.goto('/org-chart')
    await expect(page.getByText('Backend')).toBeVisible()

    // Collapse the Engineering node
    await page.getByRole('button', { name: /collapse/i }).first().click()
    await expect(page.getByText('Backend')).not.toBeVisible()

    // Expand again
    await page.getByRole('button', { name: /expand/i }).first().click()
    await expect(page.getByText('Backend')).toBeVisible()
  })

  test('clicking a node navigates to departments page', async ({ page, request }) => {
    const { accessToken, company } = await loginAndGetToken(request, 'oc-ui-link')

    await createDeptViaApi(request, accessToken, testDepartment({ name: 'Sales' }))

    await page.goto('/login')
    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/)

    await page.goto('/org-chart')
    await page.getByText('Sales').click()

    await expect(page).toHaveURL(/\/departments/)
  })
})
