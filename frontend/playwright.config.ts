import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: [
    {
      // Start backend dev server
      command: 'pnpm -C ../backend dev',
      url: 'http://localhost:4000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // Start frontend preview
      command: 'pnpm preview',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
  },
})


