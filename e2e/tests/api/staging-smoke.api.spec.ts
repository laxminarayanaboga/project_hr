import { test, expect } from '@playwright/test'

// Run against staging with: API_URL=http://<alb-dns> npx playwright test staging-smoke
// The API_URL env var is picked up by playwright.config.ts

test.describe('Staging smoke tests', () => {
  test('health check returns UP', async ({ request }) => {
    const res = await request.get('/actuator/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('UP')
  })

  test('bad login returns 401 not 500', async ({ request }) => {
    const res = await request.post('/api/v1/auth/login', {
      data: { email: 'nobody@example.com', password: 'wrong' },
    })
    expect(res.status()).toBe(401)
  })

  test('register with missing fields returns 400', async ({ request }) => {
    const res = await request.post('/api/v1/auth/register', {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('protected endpoint without token returns 401', async ({ request }) => {
    const res = await request.get('/api/v1/employees')
    expect(res.status()).toBe(401)
  })
})
