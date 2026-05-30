import { test, expect, Page } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
}

test.describe('Employee List Page', () => {
  let email: string
  let password: string

  test.beforeEach(async ({ page, request }) => {
    const company = testCompany('emp-ui')
    await request.post(`${API}/auth/register`, { data: company })
    email = company.email
    password = company.password
    await loginAs(page, email, password)
  })

  test('shows employees page via sidebar nav', async ({ page }) => {
    await page.getByRole('link', { name: /employees/i }).click()
    await expect(page).toHaveURL(/\/employees/)
    await expect(page.getByRole('heading', { name: /employees/i })).toBeVisible()
  })

  test('shows empty state with no employees', async ({ page }) => {
    await page.goto('/employees')
    // Table renders (even if empty — no server error)
    await expect(page.locator('table')).toBeVisible()
  })

  test('search input is visible and accepts input', async ({ page }) => {
    await page.goto('/employees')
    const search = page.getByPlaceholder(/search by name/i)
    await expect(search).toBeVisible()
    await search.fill('Jane')
  })

  test('add employee button is visible for HR Admin', async ({ page }) => {
    await page.goto('/employees')
    await expect(page.getByRole('link', { name: /add employee/i })).toBeVisible()
  })
})

test.describe('Employee Detail Page', () => {
  test('shows employee details after creation via API', async ({ page, request }) => {
    const company = testCompany('emp-detail')
    const regRes = await request.post(`${API}/auth/register`, { data: company })
    const { data: { accessToken } } = await regRes.json()

    const empRes = await request.post(`${API}/employees`, {
      data: { firstName: 'Alice', lastName: 'Johnson', startDate: '2026-01-01', jobTitle: 'Designer' },
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const { data: emp } = await empRes.json()

    await loginAs(page, company.email, company.password)
    await page.goto(`/employees/${emp.id}`)

    await expect(page.getByRole('heading', { name: /alice johnson/i })).toBeVisible()
    await expect(page.getByText('Designer')).toBeVisible()
  })
})
