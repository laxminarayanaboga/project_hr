import { test, expect } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

test.describe('POST /auth/register', () => {
  test('creates company and admin user, returns tokens', async ({ request }) => {
    const company = testCompany('register')

    const res = await request.post(`${API}/auth/register`, { data: company })

    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.accessToken).toBeTruthy()
    expect(body.data.refreshToken).toBeTruthy()
    expect(body.data.user.role).toBe('HR_ADMIN')
    expect(body.data.user.email).toBe(company.email)
  })

  test('returns 400 when email already registered', async ({ request }) => {
    const company = testCompany('duplicate')
    await request.post(`${API}/auth/register`, { data: company })

    const res = await request.post(`${API}/auth/register`, { data: company })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBeTruthy()
  })

  test('returns 400 when required fields missing', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { email: 'missing@fields.com' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('VALIDATION_ERROR')
  })
})

test.describe('POST /auth/login', () => {
  test('returns tokens for valid credentials', async ({ request }) => {
    const company = testCompany('login')
    await request.post(`${API}/auth/register`, { data: company })

    const res = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: company.password },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.accessToken).toBeTruthy()
    expect(body.data.refreshToken).toBeTruthy()
  })

  test('returns 401 for wrong password', async ({ request }) => {
    const company = testCompany('wrongpw')
    await request.post(`${API}/auth/register`, { data: company })

    const res = await request.post(`${API}/auth/login`, {
      data: { email: company.email, password: 'WrongPassword!' },
    })

    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('INVALID_CREDENTIALS')
  })

  test('returns 401 for unknown email', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { email: 'nobody@nowhere.com', password: 'whatever' },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('POST /auth/refresh', () => {
  test('issues new access token from valid refresh token', async ({ request }) => {
    const company = testCompany('refresh')
    const regRes = await request.post(`${API}/auth/register`, { data: company })
    const { data } = await regRes.json()

    const res = await request.post(`${API}/auth/refresh`, {
      data: { refreshToken: data.refreshToken },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.accessToken).toBeTruthy()
    expect(body.data.accessToken).not.toBe(data.accessToken)
  })

  test('returns 401 for invalid refresh token', async ({ request }) => {
    const res = await request.post(`${API}/auth/refresh`, {
      data: { refreshToken: 'not-a-valid-token' },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('POST /auth/logout', () => {
  test('invalidates refresh token and returns 200', async ({ request }) => {
    const company = testCompany('logout')
    const regRes = await request.post(`${API}/auth/register`, { data: company })
    const { data } = await regRes.json()

    const res = await request.post(`${API}/auth/logout`, {
      data: { refreshToken: data.refreshToken },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('refresh fails after logout', async ({ request }) => {
    const company = testCompany('logout-then-refresh')
    const regRes = await request.post(`${API}/auth/register`, { data: company })
    const { data } = await regRes.json()

    await request.post(`${API}/auth/logout`, {
      data: { refreshToken: data.refreshToken },
    })

    const res = await request.post(`${API}/auth/refresh`, {
      data: { refreshToken: data.refreshToken },
    })

    expect(res.status()).toBe(401)
  })

  test('returns 200 for unknown token (idempotent)', async ({ request }) => {
    const res = await request.post(`${API}/auth/logout`, {
      data: { refreshToken: 'unknown-token' },
    })
    expect(res.status()).toBe(200)
  })

  test('returns 400 when token missing', async ({ request }) => {
    const res = await request.post(`${API}/auth/logout`, { data: {} })
    expect(res.status()).toBe(400)
  })
})

test.describe('Protected routes', () => {
  test('returns 401 when no Authorization header', async ({ request }) => {
    const res = await request.get(`${API}/employees`)
    expect(res.status()).toBe(401)
  })

  test('returns 401 when token is expired or invalid', async ({ request }) => {
    const res = await request.get(`${API}/employees`, {
      headers: { Authorization: 'Bearer invalid.jwt.token' },
    })
    expect(res.status()).toBe(401)
  })
})
