import { test, expect } from '../../fixtures/auth.fixture'
import { testEmployee } from '../../utils/test-data'
import * as path from 'path'

const API = process.env.API_URL || 'http://localhost:8080'

test.describe('Documents API', () => {
  test('HR Admin can upload a document for an employee', async ({ authedRequest }) => {
    // Create an employee first
    const empRes = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    expect(empRes.status()).toBe(201)
    const emp = (await empRes.json()).data

    // Upload a PDF document (use multipart form)
    const pdfContent = Buffer.from('%PDF-1.4 minimal')
    const uploadRes = await authedRequest.post('/api/v1/documents/upload', {
      multipart: {
        employeeId: emp.id,
        type: 'CONTRACT',
        name: 'Employment Contract',
        file: {
          name: 'contract.pdf',
          mimeType: 'application/pdf',
          buffer: pdfContent,
        },
      },
    })

    expect(uploadRes.status()).toBe(201)
    const body = await uploadRes.json()
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Employment Contract')
    expect(body.data.type).toBe('CONTRACT')
    expect(body.data.mimeType).toBe('application/pdf')
    expect(body.data.employeeId).toBe(emp.id)
  })

  test('GET /employees/{id}/documents returns document list', async ({ authedRequest }) => {
    const empRes = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const emp = (await empRes.json()).data

    // Upload a doc
    await authedRequest.post('/api/v1/documents/upload', {
      multipart: {
        employeeId: emp.id,
        type: 'ID',
        name: 'Passport',
        file: {
          name: 'passport.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 id'),
        },
      },
    })

    const listRes = await authedRequest.get(`/api/v1/employees/${emp.id}/documents`)
    expect(listRes.status()).toBe(200)
    const body = await listRes.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(1)
    expect(body.data[0].name).toBe('Passport')
  })

  test('GET /documents/{id}/download returns a download URL', async ({ authedRequest }) => {
    const empRes = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const emp = (await empRes.json()).data

    const uploadRes = await authedRequest.post('/api/v1/documents/upload', {
      multipart: {
        employeeId: emp.id,
        type: 'CONTRACT',
        file: {
          name: 'cv.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 cv'),
        },
      },
    })
    const docId = (await uploadRes.json()).data.id

    const dlRes = await authedRequest.get(`/api/v1/documents/${docId}/download`)
    expect(dlRes.status()).toBe(200)
    const body = await dlRes.json()
    expect(body.data.downloadUrl).toContain('/file?token=')
    expect(body.data.expiresAt).toBeGreaterThan(Date.now())
  })

  test('DELETE /documents/{id} removes the document', async ({ authedRequest }) => {
    const empRes = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const emp = (await empRes.json()).data

    const uploadRes = await authedRequest.post('/api/v1/documents/upload', {
      multipart: {
        employeeId: emp.id,
        type: 'OTHER',
        file: {
          name: 'misc.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4'),
        },
      },
    })
    const docId = (await uploadRes.json()).data.id

    const delRes = await authedRequest.delete(`/api/v1/documents/${docId}`)
    expect(delRes.status()).toBe(200)

    // Confirm it's gone
    const listRes = await authedRequest.get(`/api/v1/employees/${emp.id}/documents`)
    const docs = (await listRes.json()).data
    expect(docs.find((d: { id: string }) => d.id === docId)).toBeUndefined()
  })

  test('upload returns 400 for unsupported file type', async ({ authedRequest }) => {
    const empRes = await authedRequest.post('/api/v1/employees', { data: testEmployee() })
    const emp = (await empRes.json()).data

    const res = await authedRequest.post('/api/v1/documents/upload', {
      multipart: {
        employeeId: emp.id,
        file: {
          name: 'bad.exe',
          mimeType: 'application/octet-stream',
          buffer: Buffer.from('exe-bytes'),
        },
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('INVALID_FILE_TYPE')
  })

  test('upload returns 404 for non-existent employee', async ({ authedRequest }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const res = await authedRequest.post('/api/v1/documents/upload', {
      multipart: {
        employeeId: fakeId,
        file: {
          name: 'f.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF'),
        },
      },
    })
    expect(res.status()).toBe(404)
  })
})
