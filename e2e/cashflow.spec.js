/**
 * Modul 6 – Arus Kas (Cash Flow)
 * Skenario 6.1 – 6.2
 */
import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin } from './helpers.js';

test.describe('6. Modul Arus Kas (Cash Flow)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await loginAsAdmin(page);
    await page.goto('/cash-flow');
    await page.waitForLoadState('networkidle');
  });

  // ── Skenario 6.1: Mencatat Pemasukan / Modal Awal ────────────────
  test('6.1 – Mencatat pemasukan modal awal', async ({ page }) => {
    // Click "Tambah Entri" / "Add Entry" button
    const addButton = page.locator('button', { hasText: /Add Entry|Tambah Entri|Tambah/i });
    await addButton.click();

    // Modal should open
    await expect(page.locator('.mantine-Modal-content')).toBeVisible();

    const modal = page.locator('.mantine-Modal-content');

    // Select "Income" / "Pemasukan" type (via SegmentedControl)
    const incomeLabel = modal.locator('.mantine-SegmentedControl-label').filter({ hasText: /Income|Pemasukan/i });
    if (await incomeLabel.isVisible()) {
      await incomeLabel.click();
    }

    // Select source from dropdown
    const sourceSelect = modal.locator('.mantine-Select-input').first();
    await sourceSelect.click();
    await page.locator('[class*="Select-option"], [class*="Combobox-option"]').first().click();

    // Fill amount
    const amountInput = modal.locator('.mantine-NumberInput-input').first();
    await amountInput.fill('500000');

    // Submit - the button text is "Record Income" / "Catat Pemasukan" etc.
    // Use the last non-close button in the modal
    const submitButton = modal.locator('button:not([class*="CloseButton"])').last();
    await submitButton.click();

    // Success notification
    await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Skenario 6.2: Mencatat Pengeluaran ────────────────────────────
  test('6.2 – Mencatat pengeluaran operasional', async ({ page }) => {
    const addButton = page.locator('button', { hasText: /Add Entry|Tambah Entri|Tambah/i });
    await addButton.click();

    await expect(page.locator('.mantine-Modal-content')).toBeVisible();
    const modal = page.locator('.mantine-Modal-content');

    // Select "Expense" / "Pengeluaran" type
    const expenseLabel = modal.locator('.mantine-SegmentedControl-label').filter({ hasText: /Expense|Pengeluaran/i });
    if (await expenseLabel.isVisible()) {
      await expenseLabel.click();
    }

    // Select source
    const sourceSelect = modal.locator('.mantine-Select-input').first();
    await sourceSelect.click();
    await page.locator('[class*="Select-option"], [class*="Combobox-option"]').first().click();

    // Fill amount
    const amountInput = modal.locator('.mantine-NumberInput-input').first();
    await amountInput.fill('200000');

    // Submit
    const submitButton = modal.locator('button:not([class*="CloseButton"])').last();
    await submitButton.click();

    // Success notification
    await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
  });
});
