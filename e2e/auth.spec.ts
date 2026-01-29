import { test, expect } from '@playwright/test';

test('has title and sign up button', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/BioinformaticsHub/);

  // Check for Get Started or Sign Up link
  const getStarted = page.getByRole('link', { name: /Get Started|Sign Up/i }).first();
  await expect(getStarted).toBeVisible();
});

test('can navigate to directory', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Directory' }).first().click();
  await expect(page).toHaveURL(/.*directory/);
  // Expect the main title
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Directory/i);
});
