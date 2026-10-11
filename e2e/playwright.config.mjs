import { defineConfig, devices } from '@playwright/test';
import { API_URL, APP_URL } from './api.mjs';

export default defineConfig({
  testDir: '.',
  outputDir: 'test-results',
  globalSetup: './global-setup.mjs',
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : 'list',
  use: {
    baseURL: `${APP_URL}/`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${new URL(APP_URL).port} --strictPort`,
    cwd: '..',
    url: `${APP_URL}/`,
    env: { VUE_APP_SERVER_URL: API_URL },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
