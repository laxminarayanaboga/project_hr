import { test as base, expect, APIRequestContext, Page } from '@playwright/test'

const API = process.env.API_URL || 'http://localhost:8080'

export interface AuthFixtures {
  adminToken: string
  managerToken: string
  employeeToken: string
  authedRequest: APIRequestContext
  loginAs: (role: 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE') => Promise<void>
}

// Creates a fresh test company + admin user and returns the JWT.
// Each test that uses adminToken gets an isolated company — no shared state.
async function createTestCompany(request: APIRequestContext, suffix: string) {
  const ts = Date.now()
  const res = await request.post(`${API}/api/v1/auth/register`, {
    data: {
      companyName: `Test Co ${suffix} ${ts}`,
      email: `admin-${suffix}-${ts}@test.com`,
      password: 'TestPass123!',
    },
  })
  expect(res.status()).toBe(201)
  const body = await res.json()
  return body.data as { accessToken: string; refreshToken: string; user: Record<string, unknown> }
}

async function browserLogin(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder(/you@company/i).fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
}

export const test = base.extend<AuthFixtures>({
  adminToken: async ({ request }, use) => {
    const { accessToken } = await createTestCompany(request, 'admin')
    await use(accessToken)
  },

  authedRequest: async ({ playwright, adminToken }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: API,
      extraHTTPHeaders: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    })
    await use(ctx)
    await ctx.dispose()
  },

  managerToken: async ({ authedRequest }, use) => {
    // Create an employee with MANAGER role and return their token
    const emp = await authedRequest.post('/api/v1/employees', {
      data: {
        firstName: 'Test', lastName: 'Manager',
        email: `manager-${Date.now()}@test.com`,
        role: 'MANAGER', startDate: '2026-01-01',
      },
    })
    const { data } = await emp.json()
    const loginRes = await authedRequest.post('/api/v1/auth/login', {
      data: { email: data.email, password: 'TestPass123!' },
    })
    const loginBody = await loginRes.json()
    await use(loginBody.data.accessToken)
  },

  employeeToken: async ({ authedRequest }, use) => {
    const emp = await authedRequest.post('/api/v1/employees', {
      data: {
        firstName: 'Test', lastName: 'Employee',
        email: `employee-${Date.now()}@test.com`,
        role: 'EMPLOYEE', startDate: '2026-01-01',
      },
    })
    const { data } = await emp.json()
    const loginRes = await authedRequest.post('/api/v1/auth/login', {
      data: { email: data.email, password: 'TestPass123!' },
    })
    const loginBody = await loginRes.json()
    await use(loginBody.data.accessToken)
  },

  // UI fixture: creates an isolated company, optionally creates a non-admin user,
  // then logs in via the browser so UI tests start authenticated.
  loginAs: async ({ page, request }, use) => {
    const loginFn = async (role: 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const adminEmail = `admin-ui-${uid}@test.com`
      const password = 'TestPass123!'

      // Register fresh company (uid ensures uniqueness even in parallel runs)
      const regRes = await request.post(`${API}/api/v1/auth/register`, {
        data: {
          companyName: `UI Test Co ${uid}`,
          email: adminEmail,
          password,
        },
      })
      expect(regRes.status()).toBe(201)
      const { data: regData } = await regRes.json()

      if (role === 'HR_ADMIN') {
        await browserLogin(page, adminEmail, password)
        return
      }

      // Create employee with requested role via API
      const empEmail = `${role.toLowerCase()}-ui-${uid}@test.com`
      const empRes = await request.post(`${API}/api/v1/employees`, {
        data: {
          firstName: 'Test', lastName: role,
          email: empEmail,
          role, startDate: '2026-01-01',
        },
        headers: { Authorization: `Bearer ${regData.accessToken}` },
      })
      expect(empRes.status()).toBe(201)

      await browserLogin(page, empEmail, password)
    }

    await use(loginFn)
  },
})

export { expect }
