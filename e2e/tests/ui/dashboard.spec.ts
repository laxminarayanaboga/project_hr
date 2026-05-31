import { test, expect, Page } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(page: Page, request: any) {
  const company = testCompany('dash-ui')
  await request.post(`${API}/auth/register`, { data: company })
  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(company.email)
  await page.locator('input[type="password"]').fill(company.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
  return company
}

test.describe('Dashboard Page', () => {
  test('shows dashboard heading and stat cards after login', async ({ page, request }) => {
    await registerAndLogin(page, request)

    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByText(/total employees/i)).toBeVisible()
    await expect(page.getByText(/active/i)).toBeVisible()
    await expect(page.getByText(/departments/i)).toBeVisible()
    await expect(page.getByText(/new this month/i)).toBeVisible()
  })

  test('stats update after adding an employee', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    // Get a token to create an employee via API
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data

    // Create an employee
    await request.post(`${API}/employees`, {
      data: { firstName: 'Dash', lastName: 'Hire', jobTitle: 'Engineer', employmentType: 'FULL_TIME', startDate: '2026-05-01' },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    // Reload dashboard
    await page.reload()
    await page.waitForSelector('text=Total Employees')

    // Stat card for total employees should show at least 1
    const totalCard = page.locator('div').filter({ hasText: 'Total Employees' }).first()
    await expect(totalCard).toContainText('1')
  })

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('sidebar navigation is visible with correct links', async ({ page, request }) => {
    await registerAndLogin(page, request)

    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /employees/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /departments/i })).toBeVisible()
  })

  test('recent hires section appears after adding an employee', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data

    await request.post(`${API}/employees`, {
      data: { firstName: 'Recent', lastName: 'Hire', jobTitle: 'QA', employmentType: 'FULL_TIME', startDate: '2026-05-01' },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    await page.reload()
    await expect(page.getByText('Recent Hires')).toBeVisible()
    await expect(page.getByText('Recent Hire')).toBeVisible()
  })
})
