import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 4,

  reporter: 'html',
  
  use: {
    trace: 'on-first-retry',
    // screenshot: 'only-on-failure',
    // video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'Asia/Ho_Chi_Minh',
    viewport: { width: 1920, height: 1080 },
  },  

  /* Configure projects for major browsers */
  projects: [ 
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          //headless: true,
          headless: process.env.PW_HEADLESS === '1',
          args: [
            '--start-maximized',
            '--disable-blink-features=AutomationControlled'
          ],
        },
    },
  },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

  ],

  
});
