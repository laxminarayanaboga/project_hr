import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Attendance Page', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('EMPLOYEE')
    await page.goto('/attendance')
  })

  test('shows Attendance heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Attendance' })).toBeVisible()
  })

  test('shows Clock In button when not clocked in', async ({ page }) => {
    await expect(page.getByRole('button', { name: /clock in/i })).toBeVisible()
  })

  test('can clock in and button changes to Clock Out', async ({ page }) => {
    await page.getByRole('button', { name: /clock in/i }).click()
    await expect(page.getByRole('button', { name: /clock out/i })).toBeVisible({ timeout: 5000 })
  })

  test('history table appears after clocking out', async ({ page }) => {
    await page.getByRole('button', { name: /clock in/i }).click()
    await expect(page.getByRole('button', { name: /clock out/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /clock out/i }).click()
    await expect(page.getByText(/done for today/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('columnheader', { name: /clock in/i })).toBeVisible()
  })
})

test.describe('Overtime Page', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('HR_ADMIN')
    await page.goto('/attendance/overtime')
  })

  test('shows Overtime heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Overtime' })).toBeVisible()
  })

  test('shows empty state when no overtime records', async ({ page }) => {
    await expect(page.getByText(/no overtime records/i)).toBeVisible()
  })
})
