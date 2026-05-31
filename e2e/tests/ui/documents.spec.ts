import { test, expect, Page } from '@playwright/test'
import { testCompany, testEmployee } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(page: Page, request: any) {
  const company = testCompany('doc-ui')
  await request.post(`${API}/auth/register`, { data: company })
  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(company.email)
  await page.locator('input[type="password"]').fill(company.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
  return company
}

async function createEmployee(request: any, token: string) {
  const res = await request.post(`${API}/employees`, {
    data: testEmployee({ firstName: 'Doc', lastName: 'Test' }),
    headers: { Authorization: `Bearer ${token}` },
  })
  return (await res.json()).data
}

test.describe('Documents — Employee Detail Page', () => {
  test('Documents section is visible on employee detail page', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data
    const emp = await createEmployee(request, accessToken)

    await page.goto(`/employees/${emp.id}`)
    await expect(page.getByRole('heading', { name: /documents/i })).toBeVisible()
  })

  test('shows empty state when no documents uploaded', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data
    const emp = await createEmployee(request, accessToken)

    await page.goto(`/employees/${emp.id}`)
    await expect(page.getByText(/no documents uploaded/i)).toBeVisible()
  })

  test('Upload document button visible for HR Admin', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data
    const emp = await createEmployee(request, accessToken)

    await page.goto(`/employees/${emp.id}`)
    await expect(page.getByRole('button', { name: /upload document/i })).toBeVisible()
  })

  test('upload form appears after clicking Upload document', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data
    const emp = await createEmployee(request, accessToken)

    await page.goto(`/employees/${emp.id}`)
    await page.getByRole('button', { name: /upload document/i }).click()
    await expect(page.getByText(/drag and drop/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^upload$/i })).toBeVisible()
  })

  test('uploaded document appears in the list', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data
    const emp = await createEmployee(request, accessToken)

    await page.goto(`/employees/${emp.id}`)
    await page.getByRole('button', { name: /upload document/i }).click()

    // Set file via file chooser
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').click({ force: true }),
    ])
    await fileChooser.setFiles({
      name: 'employment-contract.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 minimal'),
    })

    // Set a name and upload
    await page.getByPlaceholder(/document name/i).fill('Employment Contract')
    await page.getByRole('button', { name: /^upload$/i }).click()

    // Document should appear in the list
    await expect(page.getByText('Employment Contract')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTitle('Download')).toBeVisible()
    await expect(page.getByTitle('Delete')).toBeVisible()
  })

  test('delete document removes it from the list', async ({ page, request }) => {
    const company = await registerAndLogin(page, request)

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const { accessToken } = (await loginRes.json()).data
    const emp = await createEmployee(request, accessToken)

    // Upload via API directly
    const pdfBuffer = Buffer.from('%PDF-1.4')
    const formData = new FormData()
    formData.append('employeeId', emp.id)
    formData.append('type', 'CONTRACT')
    formData.append('name', 'To Delete')
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'delete-me.pdf')

    await request.post(`${API}/documents/upload`, {
      multipart: {
        employeeId: emp.id,
        type: 'CONTRACT',
        name: 'To Delete',
        file: { name: 'delete-me.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    await page.goto(`/employees/${emp.id}`)
    await expect(page.getByText('To Delete')).toBeVisible()

    // Delete with confirm
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByTitle('Delete').click()

    await expect(page.getByText('To Delete')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/no documents uploaded/i)).toBeVisible()
  })
})
