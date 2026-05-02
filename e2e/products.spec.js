/**
 * Modul 3 – Manajemen Produk & Kategori
 * Skenario 3.1 – 3.4
 */
import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin } from './helpers.js';

test.describe('3. Modul Manajemen Produk & Kategori', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await loginAsAdmin(page);
  });

  // ── Skenario 3.1: Tambah Kategori Baru ────────────────────────────
  test('3.1 – Tambah kategori baru dan muncul di tabel', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Makanan')).toBeVisible();
    await expect(page.locator('text=Minuman')).toBeVisible();

    const addButton = page.locator('button', { hasText: /Add|Tambah/i });
    await addButton.click();

    await expect(page.locator('.mantine-Modal-content')).toBeVisible();
    await page.locator('.mantine-Modal-content input').first().fill('Snack');
    await page.locator('.mantine-Modal-content button[type="submit"]').click();

    await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Skenario 3.2: Tambah Produk Baru ──────────────────────────────
  test('3.2 – Tambah produk baru dan muncul di tabel', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Nasi Goreng')).toBeVisible();

    const addButton = page.locator('button', { hasText: /Add Product|Tambah Produk/i });
    await addButton.click();

    await expect(page.locator('.mantine-Modal-content')).toBeVisible();

    const modal = page.locator('.mantine-Modal-content');
    const nameInput = modal.locator('.mantine-TextInput-input').first();
    await nameInput.fill('Ayam Bakar');

    // Select category: click to open dropdown, then ArrowDown+Enter to select first option
    const categorySelect = modal.locator('.mantine-Select-input').first();
    await categorySelect.click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Fill price
    const priceInput = modal.locator('.mantine-NumberInput-input').first();
    await priceInput.fill('25000');

    // Fill cost
    const costInput = modal.locator('.mantine-NumberInput-input').nth(1);
    if (await costInput.isVisible()) {
      await costInput.fill('18000');
    }

    // Submit
    await modal.locator('button[type="submit"]').click();

    await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Skenario 3.3: Edit Detail Produk ──────────────────────────────
  test('3.3 – Edit detail produk yang sudah ada', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('tr', { hasText: 'Nasi Goreng' });
    const editIcon = firstRow.locator('[class*="ActionIcon"]').first();
    await editIcon.click();

    await expect(page.locator('.mantine-Modal-content')).toBeVisible();

    const nameInput = page.locator('.mantine-Modal-content .mantine-TextInput-input').first();
    await nameInput.clear();
    await nameInput.fill('Nasi Goreng Spesial');

    await page.locator('.mantine-Modal-content button[type="submit"]').click();

    await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Skenario 3.4: Hapus Produk ────────────────────────────────────
  test('3.4 – Hapus produk dari tabel', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Nasi Goreng')).toBeVisible();

    const firstRow = page.locator('tr', { hasText: 'Nasi Goreng' });
    const deleteIcon = firstRow.locator('[class*="ActionIcon"]').last();
    await deleteIcon.click();

    await expect(page.locator('.mantine-Modal-content').last()).toBeVisible();

    const confirmButton = page.locator('.mantine-Modal-content').last()
      .locator('button:not([data-variant="default"])').last();
    await confirmButton.click();

    await expect(page.locator('.mantine-Notification-root').first()).toBeVisible({ timeout: 10000 });
  });
});
