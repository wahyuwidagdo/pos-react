# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: debug_ui.spec.js >> debug ui rendering
- Location: e2e/debug_ui.spec.js:4:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="text"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "KALA" [level=1] [ref=e4]
  - paragraph [ref=e5]: Timeless & Simple POS System
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Nama Pengguna *
        - textbox "Nama Pengguna" [ref=e11]:
          - /placeholder: Your username
      - generic [ref=e12]:
        - generic [ref=e13]: Kata Sandi *
        - generic [ref=e14]:
          - textbox "Kata Sandi" [ref=e16]:
            - /placeholder: Your password
          - button [ref=e18] [cursor=pointer]:
            - img [ref=e20]
      - button "Masuk" [ref=e22] [cursor=pointer]:
        - generic [ref=e24]: Masuk
    - paragraph [ref=e25]:
      - text: Belum punya akun?
      - link "Daftar" [ref=e26] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupMocks, loginAsAdmin } from './helpers.js';
  3  | 
  4  | test('debug ui rendering', async ({ page }) => {
  5  |   // DO NOT MOCK API. WE WANT TO TEST REAL API INTEGRATION.
  6  |   // We'll just login manually
  7  |   await page.goto('/login');
> 8  |   await page.fill('input[type="text"]', 'admin');
     |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  9  |   await page.fill('input[type="password"]', 'password123');
  10 |   await page.click('button[type="submit"]');
  11 |   await page.waitForURL('/');
  12 | 
  13 |   // Check Transactions
  14 |   await page.goto('/transactions');
  15 |   await page.waitForLoadState('networkidle');
  16 |   const txRows = await page.locator('tbody tr').count();
  17 |   console.log('Transaction rows:', txRows);
  18 | 
  19 |   // Check Cash Flow
  20 |   await page.goto('/cash-flow');
  21 |   await page.waitForLoadState('networkidle');
  22 |   const cfRows = await page.locator('tbody tr').count();
  23 |   console.log('Cash Flow rows:', cfRows);
  24 | 
  25 |   // Check Reports
  26 |   await page.goto('/reports');
  27 |   await page.waitForLoadState('networkidle');
  28 |   const reportCards = await page.locator('.mantine-Paper-root').count();
  29 |   console.log('Report cards:', reportCards);
  30 | });
  31 | 
```