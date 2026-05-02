import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin } from './helpers.js';

test('debug ui rendering', async ({ page }) => {
  // DO NOT MOCK API. WE WANT TO TEST REAL API INTEGRATION.
  // We'll just login manually
  await page.goto('/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');

  // Check Transactions
  await page.goto('/transactions');
  await page.waitForLoadState('networkidle');
  const txRows = await page.locator('tbody tr').count();
  console.log('Transaction rows:', txRows);

  // Check Cash Flow
  await page.goto('/cash-flow');
  await page.waitForLoadState('networkidle');
  const cfRows = await page.locator('tbody tr').count();
  console.log('Cash Flow rows:', cfRows);

  // Check Reports
  await page.goto('/reports');
  await page.waitForLoadState('networkidle');
  const reportCards = await page.locator('.mantine-Paper-root').count();
  console.log('Report cards:', reportCards);
});
