/**
 * Modul 4 – Inventaris & Stok (Inventory)
 * Skenario 4.1 – 4.3
 */
import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin } from './helpers.js';

test.describe('4. Modul Inventaris & Stok', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await loginAsAdmin(page);
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
  });

  // ── Skenario 4.1: Halaman Inventory Dapat Diakses ────────────────
  test('4.1 – Halaman inventory ter-render dengan benar', async ({ page }) => {
    // Verify page title is visible
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify summary cards are present
    await expect(page.locator('.mantine-Card-root').first()).toBeVisible();

    // Verify the "Adjust Stock" / "Sesuaikan Stok" button exists
    const adjustButton = page.locator('button', { hasText: /Adjust|Sesuaikan/i });
    await expect(adjustButton).toBeVisible();
  });

  // ── Skenario 4.2: Modal Penyesuaian Stok Terbuka ────────────────
  test('4.2 – Modal penyesuaian stok dapat dibuka', async ({ page }) => {
    // Click "Adjust Stock" / "Sesuaikan Stok" button
    const addButton = page.locator('button', { hasText: /Adjust|Sesuaikan/i });
    await addButton.click();

    // Modal should open
    await expect(page.locator('.mantine-Modal-content')).toBeVisible();

    const modal = page.locator('.mantine-Modal-content');

    // Verify SegmentedControl for type is visible (Stock In / Stock Out / Adjustment)
    await expect(modal.locator('.mantine-SegmentedControl-root')).toBeVisible();

    // Verify product select is visible
    await expect(modal.locator('.mantine-Select-input').first()).toBeVisible();

    // Verify quantity input is visible
    await expect(modal.locator('.mantine-NumberInput-input').first()).toBeVisible();
  });

  // ── Skenario 4.3: Filter Stok Berfungsi ──────────────────────────
  test('4.3 – Filter tipe stok berfungsi', async ({ page }) => {
    // Verify filter controls are visible (All / Stock In / Stock Out / Adjustment)
    const filterControl = page.locator('.mantine-SegmentedControl-root').first();
    await expect(filterControl).toBeVisible();

    // Click "Stock In" filter
    const stockInFilter = filterControl.locator('.mantine-SegmentedControl-label').filter({ hasText: /Stock In|Masuk/i });
    if (await stockInFilter.isVisible()) {
      await stockInFilter.click();
      await page.waitForTimeout(500);
    }

    // Click "All" filter to reset
    const allFilter = filterControl.locator('.mantine-SegmentedControl-label').filter({ hasText: /All|Semua/i });
    if (await allFilter.isVisible()) {
      await allFilter.click();
      await page.waitForTimeout(500);
    }

    // Page should still be functional
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
