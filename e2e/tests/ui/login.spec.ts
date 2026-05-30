import { test, expect } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('shows login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByPlaceholder(/you@company/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.getByPlaceholder(/you@company/i).fill('nobody@nowhere.com')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('redirects to dashboard on successful login', async ({ page, request }) => {
    const company = testCompany('ui-login')
    await request.post(`${API}/auth/register`, { data: company })

    await page.getByPlaceholder(/you@company/i).fill(company.email)
    await page.getByRole('button', { name: /sign in/i }).click()
    // password field
    await page.locator('input[type="password"]').fill(company.password)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('has link to registration page', async ({ page }) => {
    await page.getByRole('link', { name: /register your company/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })
})
