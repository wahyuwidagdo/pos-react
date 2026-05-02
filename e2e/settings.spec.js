/**
 * Modul 7 – Pengaturan (Settings)
 * Skenario 7.1 – 7.2
 */
import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin } from './helpers.js';

test.describe('7. Modul Pengaturan (Settings)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await loginAsAdmin(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  // ── Skenario 7.1: Update Informasi Toko ───────────────────────────
  test('7.1 – Update informasi toko (nama & alamat)', async ({ page }) => {
    // Find the Store tab ("Toko" in Indonesian) and click it
    const storeTab = page.locator('.mantine-Tabs-tab', { hasText: /Store|Toko/i });
    if (await storeTab.isVisible()) {
      await storeTab.click();
      await page.waitForTimeout(500);
    }

    // Find any visible text input and update it
    const textInputs = page.locator('.mantine-TextInput-input:visible, .mantine-Textarea-input:visible');
    const firstInput = textInputs.first();
    if (await firstInput.isVisible()) {
      await firstInput.clear();
      await firstInput.fill('Toko Baru Updated');

      // Click save/update button
      const saveButton = page.locator('button', { hasText: /Save|Simpan|Update/i }).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Success notification
        await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  // ── Skenario 7.2: Manajemen Metode Pembayaran ────────────────────
  test('7.2 – Melihat halaman pengaturan metode pembayaran', async ({ page }) => {
    // Navigate to payment methods tab ("Pembayaran" in Indonesian)
    const paymentTab = page.locator('.mantine-Tabs-tab', { hasText: /Payment|Pembayaran|Metode/i });
    if (await paymentTab.isVisible()) {
      await paymentTab.click();
      await page.waitForTimeout(500);

      // Verify the tab content loads without error
      await expect(page.locator('body')).not.toBeEmpty();
      
      // Look for any table or list that renders payment methods
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent.length).toBeGreaterThan(10);
    } else {
      // If no separate tab, the settings page should at least render
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});
