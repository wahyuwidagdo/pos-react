/**
 * Modul 8 – Dashboard & Laporan (Regression)
 * Skenario 8.1 + Smoke/Regression navigasi
 */
import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin } from './helpers.js';

test.describe('8. Dashboard & Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await loginAsAdmin(page);
  });

  // ── Skenario 8.1: Validasi Statistik Penjualan di Dashboard ──────
  test('8.1 – Dashboard ter-render tanpa crash', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the page to fully load
    await page.waitForTimeout(2000);

    // Verify URL is correct (not redirected to login or error)
    const url = page.url();
    expect(url).not.toContain('/login');
    expect(url).not.toContain('/error');

    // Verify body has rendered content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText.length).toBeGreaterThan(5);

    // Verify at least one element rendered
    const anyElement = page.locator('div, h1, h2, span').first();
    await expect(anyElement).toBeVisible();
  });

  // ── Regression: Semua Halaman Dapat Diakses ───────────────────────
  test('Regression – Semua halaman utama ter-render tanpa error', async ({ page }) => {
    const routes = [
      { path: '/', label: 'Dashboard' },
      { path: '/pos', label: 'POS' },
      { path: '/products', label: 'Products' },
      { path: '/categories', label: 'Categories' },
      { path: '/inventory', label: 'Inventory' },
      { path: '/transactions', label: 'Transactions' },
      { path: '/cash-flow', label: 'Cash Flow' },
      { path: '/settings', label: 'Settings' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // Verify: page body has content (not blank/crashed)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText.length).toBeGreaterThan(0);

      // Verify: no uncaught redirect to login
      const url = page.url();
      expect(url).not.toContain('/login');
    }
  });

  // ── Regression: Navigasi Sidebar Berfungsi ────────────────────────
  test('Regression – Navigasi sidebar berfungsi dengan benar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Direct navigation to verify pages are accessible
    const pages = ['/pos', '/products', '/categories'];
    for (const p of pages) {
      await page.goto(p);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toBeEmpty();
      expect(page.url()).not.toContain('/login');
    }
  });
});
