import { defineConfig, devices } from '@playwright/test';

/**
 * Runs against a production build (`next build` + `next start`), not `next dev`.
 * Turbopack's dev server generates Tailwind utility CSS incrementally per visited
 * route and can briefly serve a bundle missing classes that exist in source but
 * haven't been scanned yet — a real failure mode encountered while debugging the
 * forest/danger token colors this suite checks. Testing dev output would make the
 * suite flaky for a reason that has nothing to do with the app being correct.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start -- -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
