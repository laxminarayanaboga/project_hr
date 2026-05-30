export const testEmployee = (overrides = {}) => ({
  firstName: 'Jane',
  lastName: 'Smith',
  jobTitle: 'Software Engineer',
  employmentType: 'FULL_TIME',
  startDate: '2026-01-15',
  ...overrides,
})

export const testDepartment = (overrides = {}) => ({
  name: 'Engineering',
  description: 'Software development team',
  ...overrides,
})

export const testCompany = (suffix = '') => {
  const ts = Date.now()
  return {
    companyName: `Acme Ltd ${suffix} ${ts}`,
    email: `hr-${suffix}-${ts}@acme.com`,
    password: 'TestPass123!',
  }
}
