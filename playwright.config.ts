import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  timeout: 30000,

  testDir: './tests',

  fullyParallel: false,

  workers: 4,

  retries: 0,

  reporter: 'html',

  use: {

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    locale: 'en-US',

    timezoneId: 'Asia/Ho_Chi_Minh',

    viewport: { width: 1920, height: 1080 },

  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],

        launchOptions: {

          headless: false,

          args: [
            '--start-maximized',
            '--disable-blink-features=AutomationControlled'
          ],
        },
      },
    },
  ],
});