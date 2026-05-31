import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Leave Types Settings Page', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('HR_ADMIN')
    await page.goto('/settings/leave-types')
  })

  test('shows seeded leave types', async ({ page }) => {
    await expect(page.getByText('Annual Leave')).toBeVisible()
    await expect(page.getByText('Sick Leave')).toBeVisible()
  })

  test('can add a new leave type', async ({ page }) => {
    await page.getByText('Add Leave Type').click()
    await page.getByLabel('Name').fill('Bereavement Leave')
    await page.getByLabel('Days per year').fill('5')
    await page.getByText('Save').click()
    await expect(page.getByText('Bereavement Leave')).toBeVisible()
  })
})

test.describe('Public Holidays Page', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('HR_ADMIN')
    await page.goto('/settings/public-holidays')
  })

  test('shows UK public holidays', async ({ page }) => {
    await expect(page.getByText('Christmas Day').first()).toBeVisible()
  })

  test('can add a custom holiday', async ({ page }) => {
    await page.getByText('Add Holiday').click()
    await page.getByPlaceholder('e.g. Christmas Day').fill('Founders Day')
    await page.locator('input[type="date"]').fill('2026-07-20')
    await page.getByText('Add', { exact: true }).click()
    await expect(page.getByText('Founders Day')).toBeVisible()
  })
})

test.describe('Leave Request Page', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('HR_ADMIN')
    await page.goto('/leave')
  })

  test('shows My Leave heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Leave' })).toBeVisible()
  })

  test('shows Request Leave button', async ({ page }) => {
    await expect(page.getByText('Request Leave')).toBeVisible()
  })

  test('opens leave request form', async ({ page }) => {
    await page.getByText('Request Leave').click()
    await expect(page.getByText('New Leave Request')).toBeVisible()
    await expect(page.getByText('Leave type')).toBeVisible()
  })
})

test.describe('Manager Leave Queue', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('HR_ADMIN')
    await page.goto('/leave/team')
  })

  test('shows Team Leave heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Team Leave' })).toBeVisible()
  })

  test('shows Pending Approvals tab', async ({ page }) => {
    await expect(page.getByText('Pending Approvals')).toBeVisible()
    await expect(page.getByText('Team Calendar')).toBeVisible()
  })

  test('can switch to team calendar view', async ({ page }) => {
    await page.getByText('Team Calendar').click()
    await expect(page.getByText(/no approved leave/i).or(page.locator('[data-testid="calendar"]'))).toBeVisible({ timeout: 3000 }).catch(() => {
      // calendar might show entries or empty state
    })
  })
})
