import { test, expect } from '@playwright/test'

test.describe('Company Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('shows registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /set up your company/i })).toBeVisible()
    await expect(page.getByText(/14-day free trial/i)).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/at least 2 characters/i)).toBeVisible()
  })

  test('shows error when passwords do not match', async ({ page }) => {
    await page.getByPlaceholder('Acme Ltd').fill('Test Company')
    await page.getByPlaceholder(/hr@yourcompany/i).fill('hr@test.com')
    await page.locator('input[type="password"]').first().fill('Password123!')
    await page.locator('input[type="password"]').last().fill('DifferentPass!')

    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('registers company and redirects to dashboard', async ({ page }) => {
    const ts = Date.now()
    await page.getByPlaceholder('Acme Ltd').fill(`Test Co ${ts}`)
    await page.getByPlaceholder(/hr@yourcompany/i).fill(`hr-${ts}@test.com`)
    await page.locator('input[type="password"]').first().fill('TestPass123!')
    await page.locator('input[type="password"]').last().fill('TestPass123!')

    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })
})
