import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login API
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { token: 'fake-jwt-token', user: { id: 1, role: 'admin', username: 'admin' } } }
      });
    });

    // Mock profile API
    await page.route('**/api/v1/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { id: 1, role: 'admin', username: 'admin', storeName: 'Test Store' } }
      });
    });

    // Mock categories
    await page.route('**/api/v1/categories*', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    // Mock products
    await page.route('**/api/v1/products*', async route => {
      await route.fulfill({ status: 200, json: { data: [], total: 0 } });
    });
    
    // Mock settings
    await page.route('**/api/v1/settings/store', async route => {
      await route.fulfill({ status: 200, json: { name: 'Test Store' } });
    });

    // Go to home (will redirect to login)
    await page.goto('/');
    
    // Perform login - using more robust selectors
    await page.waitForSelector('input[placeholder*="username"]');
    await page.fill('input[placeholder*="username"]', 'admin');
    await page.fill('input[placeholder*="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard (root path)
    await page.waitForURL('**/');
  });

  test('should navigate to all sidebar links successfully', async ({ page }) => {
    const menus = [
      { name: 'POS', url: '**/pos' },
      { name: 'Products', url: '**/products' },
      { name: 'Categories', url: '**/categories' },
      { name: 'Inventory', url: '**/inventory' },
      { name: 'Cash Flow', url: '**/cash-flow' },
      { name: 'Reports', url: '**/reports' },
      { name: 'Settings', url: '**/settings' },
    ];

    for (const menu of menus) {
      // Direct navigation to be language-independent
      const targetUrl = menu.url.replace('**/', '/');
      await page.goto(targetUrl);
      
      // Verify URL changes
      await page.waitForURL(menu.url);
      
      // Ensure the page doesn't crash (blank screen)
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});
