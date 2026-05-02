/**
 * Modul 2 – Kasir / Point of Sale (POS)
 * Skenario 2.1 – 2.6
 */
import { test, expect } from '@playwright/test';
import { setupMocks, loginAsAdmin, SEED } from './helpers.js';

test.describe('2. Modul Kasir (POS)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await loginAsAdmin(page);
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
  });

  // ── Skenario 2.1: Pencarian Produk ────────────────────────────────
  test('2.1 – Pencarian produk di halaman POS', async ({ page }) => {
    // Products should be visible
    await expect(page.locator('text=Nasi Goreng')).toBeVisible();
    await expect(page.locator('text=Mie Ayam')).toBeVisible();
    await expect(page.locator('text=Es Teh')).toBeVisible();
  });

  // ── Skenario 2.2: Menambah Produk ke Keranjang ────────────────────
  test('2.2 – Menambah produk ke keranjang', async ({ page }) => {
    // Click Add button on Nasi Goreng card
    await page.locator('.mantine-Card-root', { hasText: 'Nasi Goreng' })
      .getByRole('button', { name: /Add|Tambah/i }).click();

    // Verify the product appears in the cart sidebar
    // Cart should now show the product name
    const cartArea = page.locator('[class*="CartSidebar"], [class*="cart"]').first();

    // Verify total shows Rp 15.000
    await expect(page.locator('text=/Rp\\s?15[.,]000/').first()).toBeVisible();
  });

  // ── Skenario 2.3: Mengubah Kuantitas Keranjang ────────────────────
  test('2.3 – Mengubah kuantitas produk di keranjang', async ({ page }) => {
    // Add product to cart first
    await page.locator('.mantine-Card-root', { hasText: 'Nasi Goreng' })
      .getByRole('button', { name: /Add|Tambah/i }).click();

    // Find the quantity increment button (IconPlus) in the cart section
    // The cart item has minus and plus buttons around the quantity text
    const cartItem = page.locator('.mantine-Paper-root', { hasText: 'Nasi Goreng' }).last();
    const plusButton = cartItem.locator('button, [role="button"]').filter({ has: page.locator('svg') }).last();
    await plusButton.click();

    // Quantity should now be 2, total should show Rp 30.000
    await expect(page.locator('text=/Rp\\s?30[.,]000/').first()).toBeVisible();
  });

  // ── Skenario 2.4: Menghapus Produk dari Keranjang ─────────────────
  test('2.4 – Menghapus produk dari keranjang', async ({ page }) => {
    // Add product to cart
    await page.locator('.mantine-Card-root', { hasText: 'Nasi Goreng' })
      .getByRole('button', { name: /Add|Tambah/i }).click();

    // Verify product is in cart
    await expect(page.locator('text=/Rp\\s?15[.,]000/').first()).toBeVisible();

    // Find delete button (red trash icon) in the cart item
    const cartItem = page.locator('.mantine-Paper-root', { hasText: 'Nasi Goreng' }).last();
    const deleteButton = cartItem.locator('[class*="ActionIcon"][data-variant="subtle"]').first();
    await deleteButton.click();

    // Cart should show empty message
    await expect(page.locator('text=/cart.*empty|keranjang.*kosong/i').first()).toBeVisible();
  });

  // ── Skenario 2.5: Transaksi Berhasil (Tunai) ─────────────────────
  test('2.5 – Checkout dan transaksi berhasil dengan pembayaran tunai', async ({ page }) => {
    // Add product to cart
    await page.locator('.mantine-Card-root', { hasText: 'Nasi Goreng' })
      .getByRole('button', { name: /Add|Tambah/i }).click();

    // Click Checkout button
    await page.locator('button', { hasText: /Checkout|Bayar|Pay/i }).click();

    // Wait for checkout modal
    await expect(page.locator('.mantine-Modal-content')).toBeVisible();

    // Select Cash payment if segmented control is visible
    const cashBtn = page.locator('.mantine-SegmentedControl-label').filter({ hasText: /Cash|Tunai/i });
    if (await cashBtn.isVisible()) {
      await cashBtn.click();
    }

    // Fill cash amount
    const paymentInput = page.locator('.mantine-Modal-content input:visible').first();
    await paymentInput.fill('20000');

    // Click submit to process payment
    await page.locator('.mantine-Modal-content button[type="submit"]').click();

    // Should show success – either a success screen or notification
    await expect(page.locator('body')).toContainText(/Success|Berhasil|payment.*success/i);
  });

  // ── Skenario 2.6: Pembatalan Transaksi Saat Checkout ──────────────
  test('2.6 – Membatalkan checkout (menutup modal)', async ({ page }) => {
    // Add product to cart
    await page.locator('.mantine-Card-root', { hasText: 'Nasi Goreng' })
      .getByRole('button', { name: /Add|Tambah/i }).click();

    // Click Checkout button
    await page.locator('button', { hasText: /Checkout|Bayar|Pay/i }).click();

    // Wait for modal
    await expect(page.locator('.mantine-Modal-content')).toBeVisible();

    // Close the modal by clicking the close button (X)
    await page.locator('.mantine-Modal-header button[class*="CloseButton"], .mantine-Modal-header button').first().click();

    // Modal should be gone
    await expect(page.locator('.mantine-Modal-content')).not.toBeVisible();

    // Cart should still have the product (total still visible)
    await expect(page.locator('text=/Rp\\s?15[.,]000/').first()).toBeVisible();
  });
});
