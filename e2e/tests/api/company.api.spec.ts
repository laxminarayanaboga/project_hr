import { test, expect } from '@playwright/test'
import { testCompany } from '../../utils/test-data'

const API = 'http://localhost:8080/api/v1'

async function registerAndLogin(request: any, suffix: string) {
  const company = testCompany(suffix)
  const res = await request.post(`${API}/auth/register`, { data: company })
  const body = await res.json()
  return { accessToken: body.data.accessToken, company }
}

test.describe('GET /company', () => {
  test('returns company profile for authenticated user', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'get-profile')

    const res = await request.get(`${API}/company`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.name).toBeTruthy()
    expect(body.data.email).toBeTruthy()
    expect(body.data.country).toBe('United Kingdom')
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get(`${API}/company`)
    expect(res.status()).toBe(401)
  })
})

test.describe('PUT /company', () => {
  test('updates company profile as HR_ADMIN', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'put-profile')

    const res = await request.put(`${API}/company`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: 'Updated Corp',
        phone: '+44 800 999 3333',
        address: '99 New Street, London',
        country: 'England',
      },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.name).toBe('Updated Corp')
    expect(body.data.phone).toBe('+44 800 999 3333')
    expect(body.data.country).toBe('England')
  })

  test('returns 400 when name is blank', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'put-blank-name')

    const res = await request.put(`${API}/company`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: '', phone: null, address: null, country: 'UK' },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.put(`${API}/company`, {
      data: { name: 'Hacker Corp', phone: null, address: null, country: 'UK' },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('POST /company/logo', () => {
  test('uploads logo image and returns updated logoUrl', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'logo-upload')

    const res = await request.post(`${API}/company/logo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        file: {
          name: 'logo.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-png-bytes'),
        },
      },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.logoUrl).toMatch(/\/uploads\/logos\/.+\.png/)
  })

  test('returns 400 when file is not an image', async ({ request }) => {
    const { accessToken } = await registerAndLogin(request, 'logo-bad-file')

    const res = await request.post(`${API}/company/logo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        file: {
          name: 'malware.exe',
          mimeType: 'application/octet-stream',
          buffer: Buffer.from('not-an-image'),
        },
      },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  test('returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post(`${API}/company/logo`, {
      multipart: {
        file: { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('bytes') },
      },
    })
    expect(res.status()).toBe(401)
  })
})
