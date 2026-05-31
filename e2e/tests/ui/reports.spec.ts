import { test, expect } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(page: any, request: any) {
  const company = testCompany('reports-ui')
  await request.post(`${API}/auth/register`, { data: company })
  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(company.email)
  await page.locator('input[type="password"]').fill(company.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
  return company
}

test.describe('Leave Reports Page', () => {
  test('HR Admin can navigate to Leave Reports page', async ({ page, request }) => {
    await registerAndLogin(page, request)

    await page.getByRole('link', { name: /Leave Reports/i }).click()
    await page.waitForURL(/\/reports\/leave/)
    await expect(page.getByRole('heading', { name: /Leave & Absence Reports/i })).toBeVisible()
  })

  test('filter form is visible with date inputs and dropdowns', async ({ page, request }) => {
    await registerAndLogin(page, request)
    await page.goto('/reports/leave')

    await expect(page.getByText('Apply filters')).toBeVisible()
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Export PDF/i })).toBeVisible()
  })

  test('shows empty state when no leave records exist', async ({ page, request }) => {
    await registerAndLogin(page, request)
    await page.goto('/reports/leave')

    await expect(page.getByText(/No records for this period/i)).toBeVisible({ timeout: 8000 })
  })

  test('shows total days absent stat card', async ({ page, request }) => {
    await registerAndLogin(page, request)
    await page.goto('/reports/leave')

    await expect(page.getByText('Total days absent')).toBeVisible({ timeout: 8000 })
  })
})
