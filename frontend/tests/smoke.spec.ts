import { test, expect } from '@playwright/test'

test('loads homepage and shows title', async ({ page, baseURL }) => {
  await page.goto(baseURL || 'http://localhost:5173/')
  await expect(page.getByText('TruePlace')).toBeVisible()
})

test('submits form and shows top matches', async ({ page, baseURL }) => {
  await page.goto(baseURL || 'http://localhost:5173/')
  await page.getByRole('button', { name: 'Show My Score' }).click()
  await page.getByText('Top matches').waitFor({ state: 'visible' })
})


