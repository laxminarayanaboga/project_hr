import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const API_URL  = process.env.API_URL  || 'http://localhost:8080'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // API tests — no browser, use request fixture only
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_URL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },

    // UI tests — Chromium only for local dev, expand for CI later
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
