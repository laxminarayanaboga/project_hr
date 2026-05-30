import { test, expect } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

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

test.describe('Company Settings Page', () => {
  test('HR_ADMIN can navigate to company settings and see editable form', async ({ page, request }) => {
    await loginAs(page, request, 'ui-settings-admin')

    await page.getByRole('link', { name: /company settings/i }).click()
    await page.waitForURL(/\/settings\/company/)

    await expect(page.getByRole('heading', { name: /company settings/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /upload logo/i })).toBeVisible()
  })

  test('HR_ADMIN can update company name and see success message', async ({ page, request }) => {
    await loginAs(page, request, 'ui-settings-update')

    await page.goto('/settings/company')
    await page.waitForSelector('button:has-text("Save changes")')

    const nameInput = page.getByDisplayValue(/.+/)  // gets the name field which has a value
    await nameInput.first().fill('Renamed Company')

    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByText(/changes saved/i)).toBeVisible()
  })

  test('shows validation error when name is cleared', async ({ page, request }) => {
    await loginAs(page, request, 'ui-settings-validation')

    await page.goto('/settings/company')
    await page.waitForSelector('button:has-text("Save changes")')

    const inputs = page.locator('input')
    await inputs.first().fill('')

    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByText(/required/i)).toBeVisible()
  })
})
