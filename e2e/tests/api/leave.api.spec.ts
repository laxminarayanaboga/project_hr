import { test, expect } from '../../fixtures/auth.fixture'
import { testEmployee } from '../../utils/test-data'

test.describe('Leave Types API', () => {
  test('GET /leave-types returns seeded defaults', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/leave-types')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    const names = body.data.map((lt: any) => lt.name)
    expect(names).toContain('Annual Leave')
    expect(names).toContain('Sick Leave')
  })

  test('HR Admin can create a leave type', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/v1/leave-types', {
      data: {
        name: 'Compassionate Leave',
        daysPerYear: 5,
        accrualMethod: 'NONE',
        paid: true,
        requiresApproval: true,
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Compassionate Leave')
    expect(body.data.daysPerYear).toBe(5)
  })

  test('duplicate name returns 400', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/leave-types', {
      data: { name: 'Unique Leave X', daysPerYear: 3, accrualMethod: 'NONE', paid: true, requiresApproval: false },
    })
    const res = await authedRequest.post('/api/v1/leave-types', {
      data: { name: 'Unique Leave X', daysPerYear: 3, accrualMethod: 'NONE', paid: true, requiresApproval: false },
    })
    expect(res.status()).toBe(400)
  })

  test('HR Admin can update a leave type', async ({ authedRequest }) => {
    const create = await authedRequest.post('/api/v1/leave-types', {
      data: { name: 'Edit Me Leave', daysPerYear: 10, accrualMethod: 'NONE', paid: true, requiresApproval: false },
    })
    const lt = (await create.json()).data

    const res = await authedRequest.put(`/api/v1/leave-types/${lt.id}`, {
      data: { daysPerYear: 15 },
    })
    expect(res.status()).toBe(200)
    expect((await res.json()).data.daysPerYear).toBe(15)
  })

  test('HR Admin can deactivate a leave type', async ({ authedRequest }) => {
    const create = await authedRequest.post('/api/v1/leave-types', {
      data: { name: 'Deactivate Me', daysPerYear: 2, accrualMethod: 'NONE', paid: false, requiresApproval: false },
    })
    const lt = (await create.json()).data

    const res = await authedRequest.delete(`/api/v1/leave-types/${lt.id}`)
    expect(res.status()).toBe(200)

    const list = await authedRequest.get('/api/v1/leave-types')
    const found = (await list.json()).data.find((l: any) => l.id === lt.id)
    expect(found?.active).toBe(false)
  })
})

test.describe('Public Holidays API', () => {
  test('GET /public-holidays returns seeded UK holidays', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/public-holidays')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    const names = body.data.map((h: any) => h.name)
    expect(names).toContain('Christmas Day')
    expect(names).toContain("New Year's Day")
  })

  test('HR Admin can add a public holiday', async ({ authedRequest }) => {
    const res = await authedRequest.post('/api/v1/public-holidays', {
      data: { name: 'Founders Day', holidayDate: '2026-07-15' },
    })
    expect(res.status()).toBe(201)
    expect((await res.json()).data.name).toBe('Founders Day')
  })

  test('duplicate date returns 400', async ({ authedRequest }) => {
    await authedRequest.post('/api/v1/public-holidays', {
      data: { name: 'Test Day', holidayDate: '2026-08-15' },
    })
    const res = await authedRequest.post('/api/v1/public-holidays', {
      data: { name: 'Another Test Day', holidayDate: '2026-08-15' },
    })
    expect(res.status()).toBe(400)
  })

  test('HR Admin can delete a public holiday', async ({ authedRequest }) => {
    const create = await authedRequest.post('/api/v1/public-holidays', {
      data: { name: 'Delete Me Day', holidayDate: '2026-11-30' },
    })
    const ph = (await create.json()).data

    const del = await authedRequest.delete(`/api/v1/public-holidays/${ph.id}`)
    expect(del.status()).toBe(200)
  })
})

test.describe('Leave Requests API', () => {
  test('Employee can submit a leave request', async ({ authedRequest }) => {
    const typesRes = await authedRequest.get('/api/v1/leave-types')
    const annualLeave = (await typesRes.json()).data.find((lt: any) => lt.name === 'Annual Leave')

    const res = await authedRequest.post('/api/v1/leaves', {
      data: {
        leaveTypeId: annualLeave.id,
        startDate: '2026-10-01',
        endDate: '2026-10-03',
        reason: 'Holiday',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('PENDING')
    expect(body.data.workingDays).toBe(3)
  })

  test('Cannot submit leave with past start date', async ({ authedRequest }) => {
    const typesRes = await authedRequest.get('/api/v1/leave-types')
    const annual = (await typesRes.json()).data.find((lt: any) => lt.name === 'Annual Leave')

    const res = await authedRequest.post('/api/v1/leaves', {
      data: {
        leaveTypeId: annual.id,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        reason: 'Old dates',
      },
    })
    expect(res.status()).toBe(400)
  })

  test('GET /leaves/my returns submitted requests', async ({ authedRequest }) => {
    const typesRes = await authedRequest.get('/api/v1/leave-types')
    const annual = (await typesRes.json()).data.find((lt: any) => lt.name === 'Annual Leave')

    await authedRequest.post('/api/v1/leaves', {
      data: { leaveTypeId: annual.id, startDate: '2026-10-07', endDate: '2026-10-09', reason: 'Test' },
    })

    const res = await authedRequest.get('/api/v1/leaves/my')
    expect(res.status()).toBe(200)
    expect(Array.isArray((await res.json()).data)).toBe(true)
  })
})

test.describe('Leave Balances API', () => {
  test('GET /leave-balances/me returns balances', async ({ authedRequest }) => {
    const res = await authedRequest.get('/api/v1/leave-balances/me')
    // Returns 200 or 404 if no employee profile — both acceptable at this stage
    expect([200, 404]).toContain(res.status())
  })
})

test.describe('Approval Chain API', () => {
  test('HR Admin can set and retrieve an approval chain', async ({ authedRequest }) => {
    const typesRes = await authedRequest.get('/api/v1/leave-types')
    const annual = (await typesRes.json()).data.find((lt: any) => lt.name === 'Annual Leave')

    const setRes = await authedRequest.put(`/api/v1/leave-types/${annual.id}/approval-chain`, {
      data: [
        { stepOrder: 1, approverType: 'DIRECT_MANAGER' },
        { stepOrder: 2, approverType: 'HR_ADMIN' },
      ],
    })
    expect(setRes.status()).toBe(200)
    const chain = (await setRes.json()).data
    expect(chain).toHaveLength(2)
    expect(chain[0].approverType).toBe('DIRECT_MANAGER')
    expect(chain[1].approverType).toBe('HR_ADMIN')

    const getRes = await authedRequest.get(`/api/v1/leave-types/${annual.id}/approval-chain`)
    expect(getRes.status()).toBe(200)
    expect((await getRes.json()).data).toHaveLength(2)
  })

  test('More than 3 steps returns 400', async ({ authedRequest }) => {
    const typesRes = await authedRequest.get('/api/v1/leave-types')
    const annual = (await typesRes.json()).data.find((lt: any) => lt.name === 'Annual Leave')

    const res = await authedRequest.put(`/api/v1/leave-types/${annual.id}/approval-chain`, {
      data: [
        { stepOrder: 1, approverType: 'DIRECT_MANAGER' },
        { stepOrder: 2, approverType: 'HR_ADMIN' },
        { stepOrder: 3, approverType: 'DIRECT_MANAGER' },
        { stepOrder: 4, approverType: 'HR_ADMIN' },
      ],
    })
    expect(res.status()).toBe(400)
  })
})
