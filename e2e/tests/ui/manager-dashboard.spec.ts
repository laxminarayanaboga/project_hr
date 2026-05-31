import { test, expect } from '@playwright/test'
import { testCompany, testEmployee } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(page: any, request: any) {
  const company = testCompany('mgrdash-ui')
  await request.post(`${API}/auth/register`, { data: company })

  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(company.email)
  await page.locator('input[type="password"]').fill(company.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)

  const loginRes = await request.post(`${API}/auth/login`, {
    data: { email: company.email, password: company.password },
  })
  const token = (await loginRes.json()).data.accessToken

  return { company, token }
}

test.describe('Manager Team Overview Page', () => {
  test('HR Admin can navigate to Team Overview page', async ({ page, request }) => {
    await registerAndLogin(page, request)

    await page.getByRole('link', { name: /Team Overview/i }).click()
    await page.waitForURL(/\/dashboard\/manager/)
    await expect(page.getByRole('heading', { name: /Team Leave Overview/i })).toBeVisible()
  })

  test('shows "who is off today" and upcoming sections', async ({ page, request }) => {
    await registerAndLogin(page, request)
    await page.goto('/dashboard/manager')

    await expect(page.getByText("Who's Off Today")).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Upcoming Leaves (next 30 days)')).toBeVisible()
    await expect(page.getByText(/Monthly Absence Rate/i)).toBeVisible()
  })

  test('shows "everyone is in today" when no one is off', async ({ page, request }) => {
    await registerAndLogin(page, request)
    await page.goto('/dashboard/manager')

    await expect(page.getByText(/Everyone is in today/i)).toBeVisible({ timeout: 8000 })
  })

  test('shows employee in absence stats after creation', async ({ page, request }) => {
    const { company, token } = await registerAndLogin(page, request)

    await request.post(`${API}/employees`, {
      data: testEmployee({ firstName: 'Dash', lastName: 'Tester' }),
      headers: { Authorization: `Bearer ${token}` },
    })

    await page.goto('/dashboard/manager')
    await expect(page.getByText('Dash Tester')).toBeVisible({ timeout: 8000 })
  })
})
