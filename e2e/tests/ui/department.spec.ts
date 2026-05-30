import { test, expect } from '@playwright/test'
import { testCompany, testDepartment } from '../../utils/test-data'

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

test.describe('Departments Page', () => {
  test('HR_ADMIN can navigate to departments page and see empty state', async ({ page, request }) => {
    await loginAs(page, request, 'ui-dept-empty')

    await page.goto('/departments')

    await expect(page.getByRole('heading', { name: /departments/i })).toBeVisible()
    await expect(page.getByText(/no departments yet/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add department/i })).toBeVisible()
  })

  test('HR_ADMIN can create a department', async ({ page, request }) => {
    await loginAs(page, request, 'ui-dept-create')

    await page.goto('/departments')
    await page.getByRole('button', { name: /add department/i }).click()

    await expect(page.getByText('New Department')).toBeVisible()
    await page.getByPlaceholder(/e\.g\. engineering/i).fill('Product')
    await page.getByPlaceholder(/optional/i).fill('Product management')
    await page.getByRole('button', { name: /create department/i }).click()

    await expect(page.getByText('Product')).toBeVisible()
    await expect(page.getByText('Product management')).toBeVisible()
  })

  test('HR_ADMIN can edit a department', async ({ page, request }) => {
    const company = await loginAs(page, request, 'ui-dept-edit')

    await page.goto('/departments')
    await page.getByRole('button', { name: /add department/i }).click()
    await page.getByPlaceholder(/e\.g\. engineering/i).fill('Engineering')
    await page.getByRole('button', { name: /create department/i }).click()
    await expect(page.getByText('Engineering')).toBeVisible()

    await page.getByTitle('Edit').first().click()
    await expect(page.getByDisplayValue('Engineering')).toBeVisible()

    await page.getByDisplayValue('Engineering').fill('R&D')
    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByText('R&D')).toBeVisible()
    await expect(page.queryByText('Engineering')).toBeNull()
  })

  test('HR_ADMIN can delete a department', async ({ page, request }) => {
    await loginAs(page, request, 'ui-dept-delete')

    await page.goto('/departments')
    await page.getByRole('button', { name: /add department/i }).click()
    await page.getByPlaceholder(/e\.g\. engineering/i).fill('Temp Dept')
    await page.getByRole('button', { name: /create department/i }).click()
    await expect(page.getByText('Temp Dept')).toBeVisible()

    page.once('dialog', dialog => dialog.accept())
    await page.getByTitle('Delete').first().click()

    await expect(page.getByText('Temp Dept')).not.toBeVisible()
  })
})
