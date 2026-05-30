import { test, expect } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

test.describe('Logout', () => {
  test('sign out button redirects to login and clears session', async ({ page, request }) => {
    const company = testCompany('ui-logout')
    await request.post(`${API}/auth/register`, { data: company })

    await page.goto('/login')
    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)

    await page.getByRole('button', { name: /sign out/i }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('protected route redirects to login after logout', async ({ page, request }) => {
    const company = testCompany('ui-logout-protected')
    await request.post(`${API}/auth/register`, { data: company })

    await page.goto('/login')
    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)

    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
