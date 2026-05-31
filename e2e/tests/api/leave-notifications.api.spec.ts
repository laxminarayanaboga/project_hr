import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080/api/v1';
const MAILPIT = 'http://localhost:8025';

async function login(request: any, email: string, password: string): Promise<string> {
  const res = await request.post(`${BASE}/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  return body.data.accessToken;
}

async function waitForEmail(request: any, subject: string, timeoutMs = 10000): Promise<any> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await request.get(`${MAILPIT}/api/v1/messages`);
    const body = await res.json();
    const messages = body.messages ?? [];
    const match = messages.find((m: any) => m.Subject?.includes(subject));
    if (match) return match;
    await new Promise(r => setTimeout(r, 500));
  }
  return null;
}

async function deleteAllEmails(request: any) {
  await request.delete(`${MAILPIT}/api/v1/messages`, { data: { IDs: ['*'] } });
}

/** Returns the date as ISO string, skipping forward to Monday if it falls on a weekend. */
function nextWeekday(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dow = d.getDay();
  if (dow === 6) d.setDate(d.getDate() + 2); // Sat → Mon
  if (dow === 0) d.setDate(d.getDate() + 1); // Sun → Mon
  return d.toISOString().split('T')[0];
}

test.describe('Leave email notifications', () => {
  let hrToken: string;
  let employeeToken: string;
  let managerToken: string;

  test.beforeAll(async ({ request }) => {
    hrToken       = await login(request, 'admin@pinnacle-digital.co.uk', 'Demo1234!');
    employeeToken = await login(request, 'liam.harris@pinnacle-digital.co.uk', 'Demo1234!');
    managerToken  = await login(request, 'rachel.chen@pinnacle-digital.co.uk', 'Demo1234!');
  });

  test.beforeEach(async ({ request }) => {
    await deleteAllEmails(request);
  });

  test('manager receives email when employee submits leave request', async ({ request }) => {
    // Get leave type ID
    const ltRes = await request.get(`${BASE}/leave-types`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const ltBody = await ltRes.json();
    const annualLeave = ltBody.data.find((lt: any) => lt.name === 'Annual Leave');
    expect(annualLeave).toBeTruthy();

    // Submit a leave request
    const submitRes = await request.post(`${BASE}/leaves`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
      data: {
        leaveTypeId: annualLeave.id,
        startDate: nextWeekday(60),
        endDate: nextWeekday(62),
        reason: 'E2E test leave',
      },
    });
    expect(submitRes.status()).toBeLessThan(300);

    // Check Mailpit for the notification email
    const email = await waitForEmail(request, 'Leave request from');
    expect(email).toBeTruthy();
    expect(email.Subject).toContain('Leave request from');
  });

  test('employee receives email when leave is approved', async ({ request }) => {
    // Get employee's pending leave requests
    const listRes = await request.get(`${BASE}/leaves/my`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const listBody = await listRes.json();
    const pending = listBody.data?.find((lr: any) => lr.status === 'PENDING');

    if (!pending) {
      test.skip();
      return;
    }

    await deleteAllEmails(request);

    const approveRes = await request.put(`${BASE}/leaves/${pending.id}/approve`, {
      headers: { Authorization: `Bearer ${managerToken}` },
      data: { comment: 'Approved via E2E test' },
    });
    expect(approveRes.status()).toBeLessThan(300);

    const email = await waitForEmail(request, 'Your leave has been approved');
    expect(email).toBeTruthy();
  });

  test('employee receives email when leave is rejected', async ({ request }) => {
    // Submit a new leave request to reject
    const ltRes = await request.get(`${BASE}/leave-types`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const annualLeave = (await ltRes.json()).data.find((lt: any) => lt.name === 'Annual Leave');

    const submitRes = await request.post(`${BASE}/leaves`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
      data: {
        leaveTypeId: annualLeave.id,
        startDate: nextWeekday(93),
        endDate: nextWeekday(94),
        reason: 'E2E reject test',
      },
    });
    const submitBody = await submitRes.json();
    const requestId = submitBody.data?.id;
    expect(requestId).toBeTruthy();

    await deleteAllEmails(request);

    const rejectRes = await request.put(`${BASE}/leaves/${requestId}/reject`, {
      headers: { Authorization: `Bearer ${managerToken}` },
      data: { comment: 'Not enough team coverage for this period' },
    });
    expect(rejectRes.status()).toBeLessThan(300);

    const email = await waitForEmail(request, 'Your leave request was not approved');
    expect(email).toBeTruthy();
  });
});
