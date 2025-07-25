import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  test('should display the todo app', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/)
  })
})