/**
 * Shared E2E test helpers & API mock factories.
 *
 * All tests use mocked API routes so that they are deterministic, fast,
 * and do not depend on a running backend.
 */

// ─── Seed data ─────────────────────────────────────────────────────────
export const SEED = {
  user: { id: 1, username: 'admin', role: 'admin', full_name: 'Admin Test' },
  token: 'fake-jwt-token-for-testing',
  store: { store_name: 'Toko Test', address: 'Jl. Testing 123', phone: '08123456789', footer_text: 'Terima kasih!' },
  categories: [
    { id: 1, name: 'Makanan', product_count: 2 },
    { id: 2, name: 'Minuman', product_count: 1 },
  ],
  products: [
    { id: 1, name: 'Nasi Goreng', sku: 'SKU-001', barcode: '1234567890', price: 15000, cost: 10000, stock: 50, category_id: 1, category: { id: 1, name: 'Makanan' }, image: '', description: 'Nasi goreng spesial' },
    { id: 2, name: 'Mie Ayam', sku: 'SKU-002', barcode: '1234567891', price: 12000, cost: 8000, stock: 30, category_id: 1, category: { id: 1, name: 'Makanan' }, image: '', description: 'Mie ayam bakso' },
    { id: 3, name: 'Es Teh', sku: 'SKU-003', barcode: '1234567892', price: 5000, cost: 2000, stock: 100, category_id: 2, category: { id: 2, name: 'Minuman' }, image: '', description: 'Es teh manis' },
  ],
  paymentMethods: [
    { id: 1, name: 'Cash', is_cash: true, is_active: true, sort_order: 1 },
    { id: 2, name: 'QRIS', is_cash: false, is_active: true, sort_order: 2 },
  ],
  transactions: [
    { id: 1, transaction_code: 'TRX-20260501-001', grand_total: 15000, payment_method: 'Cash', status: 'completed', created_at: '2026-05-01T10:00:00Z', transaction_details: [{ product_name: 'Nasi Goreng', price_at_sale: 15000, quantity: 1 }] },
    { id: 2, transaction_code: 'TRX-20260501-002', grand_total: 17000, payment_method: 'QRIS', status: 'completed', created_at: '2026-05-01T11:00:00Z', transaction_details: [{ product_name: 'Mie Ayam', price_at_sale: 12000, quantity: 1 }, { product_name: 'Es Teh', price_at_sale: 5000, quantity: 1 }] },
  ],
  cashFlowEntries: [
    { id: 1, type: 'income', source: 'modal_awal', amount: 1000000, date: '2026-05-01', notes: 'Modal awal toko', user: { username: 'admin' } },
    { id: 2, type: 'expense', source: 'sewa', amount: 500000, date: '2026-05-01', notes: 'Bayar sewa bulan Mei', user: { username: 'admin' } },
  ],
  cashFlowSummary: { total_capital: 1000000, total_income: 32000, total_expense: 500000, net_profit: 532000 },
  inventoryEntries: [
    { id: 1, type: 'in', source: 'purchase', quantity: 10, cost_per_unit: 10000, notes: 'Restock Nasi Goreng', product: { id: 1, name: 'Nasi Goreng' }, user: { username: 'admin' }, created_at: '2026-05-01T09:00:00Z' },
  ],
  dashboard: {
    total_revenue: 32000,
    total_transactions: 2,
    total_products: 3,
    total_categories: 2,
    revenue_trend: [],
    recent_transactions: [],
    top_products: [{ product_id: 1, product_name: 'Nasi Goreng', quantity: 5, revenue: 75000 }],
    low_stock_products: [],
    payment_method_breakdown: [{ method: 'Cash', total: 15000 }],
    cash_flow_breakdown: { income: 1032000, expense: 500000 },
  },
  stockCounts: { all: 3, high: 2, low: 1, out: 0 },
};

// ─── Route handler factory ─────────────────────────────────────────────

/**
 * State holder that lets individual tests mutate mock data mid-test.
 * Each test should call `resetMockState()` in beforeEach to get a
 * clean copy of the seed data.
 */
let _state = {};

export function resetMockState() {
  _state = {
    categories: JSON.parse(JSON.stringify(SEED.categories)),
    products: JSON.parse(JSON.stringify(SEED.products)),
    transactions: JSON.parse(JSON.stringify(SEED.transactions)),
    cashFlowEntries: JSON.parse(JSON.stringify(SEED.cashFlowEntries)),
    cashFlowSummary: JSON.parse(JSON.stringify(SEED.cashFlowSummary)),
    inventoryEntries: JSON.parse(JSON.stringify(SEED.inventoryEntries)),
    paymentMethods: JSON.parse(JSON.stringify(SEED.paymentMethods)),
    store: JSON.parse(JSON.stringify(SEED.store)),
    dashboard: JSON.parse(JSON.stringify(SEED.dashboard)),
    stockCounts: JSON.parse(JSON.stringify(SEED.stockCounts)),
    nextId: 100,
  };
  return _state;
}

export function getMockState() {
  return _state;
}

/**
 * Install catch-all API mocks on `page`. Each route handler reads from
 * `_state` so mutations done by POST/PUT/DELETE handlers are reflected
 * in subsequent GET responses within the same test.
 */
export async function setupMocks(page) {
  resetMockState();

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // ── Auth ────────────────────────────────────────────────────────
    if (url.includes('auth/login')) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        if (body?.username === 'admin' && body?.password === 'password') {
          return route.fulfill({ status: 200, json: { data: { token: SEED.token, user: SEED.user } } });
        }
        return route.fulfill({ status: 401, json: { error: 'Invalid credentials' } });
      }
    }
    if (url.includes('auth/profile')) {
      if (method === 'PUT') {
        return route.fulfill({ status: 200, json: { data: SEED.user } });
      }
      return route.fulfill({ status: 200, json: { data: SEED.user } });
    }
    if (url.includes('auth/change-password')) {
      return route.fulfill({ status: 200, json: { message: 'Password changed' } });
    }

    // ── Settings ────────────────────────────────────────────────────
    if (url.includes('settings/payment-methods')) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        const pm = { id: _state.nextId++, ...body };
        _state.paymentMethods.push(pm);
        return route.fulfill({ status: 201, json: { data: pm } });
      }
      if (method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        const body = route.request().postDataJSON();
        _state.paymentMethods = _state.paymentMethods.map(pm => pm.id === id ? { ...pm, ...body } : pm);
        return route.fulfill({ status: 200, json: { data: _state.paymentMethods.find(pm => pm.id === id) } });
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        _state.paymentMethods = _state.paymentMethods.filter(pm => pm.id !== id);
        return route.fulfill({ status: 200, json: { message: 'deleted' } });
      }
      return route.fulfill({ status: 200, json: { data: _state.paymentMethods } });
    }
    if (url.includes('settings/store')) {
      if (method === 'PUT') {
        const body = route.request().postDataJSON();
        Object.assign(_state.store, body);
        return route.fulfill({ status: 200, json: { data: _state.store } });
      }
      return route.fulfill({ status: 200, json: { data: _state.store } });
    }

    // ── Categories ──────────────────────────────────────────────────
    if (url.includes('/categories')) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        const cat = { id: _state.nextId++, name: body.name, product_count: 0 };
        _state.categories.push(cat);
        return route.fulfill({ status: 201, json: { data: cat } });
      }
      if (method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        const body = route.request().postDataJSON();
        _state.categories = _state.categories.map(c => c.id === id ? { ...c, ...body } : c);
        return route.fulfill({ status: 200, json: { data: _state.categories.find(c => c.id === id) } });
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        _state.categories = _state.categories.filter(c => c.id !== id);
        return route.fulfill({ status: 200, json: { message: 'deleted' } });
      }
      return route.fulfill({ status: 200, json: { data: _state.categories } });
    }

    // ── Products ────────────────────────────────────────────────────
    if (url.includes('stock-counts')) {
      return route.fulfill({ status: 200, json: { data: _state.stockCounts } });
    }
    if (url.includes('/products')) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        const prod = { id: _state.nextId++, ...body, category: _state.categories.find(c => c.id === body.category_id) || { name: 'Unknown' } };
        _state.products.push(prod);
        return route.fulfill({ status: 201, json: { data: prod } });
      }
      if (method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        const body = route.request().postDataJSON();
        _state.products = _state.products.map(p => p.id === id ? { ...p, ...body } : p);
        return route.fulfill({ status: 200, json: { data: _state.products.find(p => p.id === id) } });
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        _state.products = _state.products.filter(p => p.id !== id);
        return route.fulfill({ status: 200, json: { message: 'deleted' } });
      }
      // GET (list)
      return route.fulfill({ status: 200, json: { data: _state.products, total: _state.products.length, total_items: _state.products.length, total_page: 1 } });
    }

    // ── Transactions ────────────────────────────────────────────────
    if (url.includes('/transactions')) {
      if (method === 'POST') {
        // Check for cancel/return action URLs
        if (url.includes('/cancel')) {
          const id = parseInt(url.split('/').filter(s => !isNaN(s)).pop());
          _state.transactions = _state.transactions.map(t => t.id === id ? { ...t, status: 'cancelled' } : t);
          return route.fulfill({ status: 200, json: { data: _state.transactions.find(t => t.id === id) } });
        }
        if (url.includes('/return')) {
          const id = parseInt(url.split('/').filter(s => !isNaN(s)).pop());
          _state.transactions = _state.transactions.map(t => t.id === id ? { ...t, status: 'returned' } : t);
          return route.fulfill({ status: 200, json: { data: _state.transactions.find(t => t.id === id) } });
        }
        // Create transaction
        const body = route.request().postDataJSON();
        const txCode = `TRX-${Date.now()}`;
        const total = (body.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
        const tx = { id: _state.nextId++, transaction_code: txCode, grand_total: total, payment_method: body.payment_method, status: 'completed', created_at: new Date().toISOString(), transaction_details: (body.items || []).map(i => ({ product_name: (_state.products.find(p => p.id === i.product_id)?.name || 'Product'), price_at_sale: i.price, quantity: i.quantity })) };
        _state.transactions.push(tx);
        return route.fulfill({ status: 201, json: { data: tx } });
      }
      // GET single transaction by id
      const idMatch = url.match(/\/transactions\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const tx = _state.transactions.find(t => t.id === id);
        return route.fulfill({ status: tx ? 200 : 404, json: tx ? { data: tx } : { error: 'Not found' } });
      }
      // GET list
      return route.fulfill({ status: 200, json: { data: { data: _state.transactions, total_pages: 1, total_items: _state.transactions.length } } });
    }

    // ── Inventory (stats must come first) ────────────────────────────
    if (url.includes('/inventory/stats')) {
      return route.fulfill({ status: 200, json: { data: { in: 10, out: 5, adjustment: 2 } } });
    }
    if (url.includes('/inventory')) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        const entry = { id: _state.nextId++, ...body, product: _state.products.find(p => p.id === body.product_id) || { name: 'Unknown' }, user: { username: 'admin' }, created_at: new Date().toISOString() };
        _state.inventoryEntries.push(entry);
        // Update product stock
        if (body.type === 'in') {
          _state.products = _state.products.map(p => p.id === body.product_id ? { ...p, stock: p.stock + body.quantity } : p);
        } else if (body.type === 'out') {
          _state.products = _state.products.map(p => p.id === body.product_id ? { ...p, stock: Math.max(0, p.stock - body.quantity) } : p);
        }
        return route.fulfill({ status: 201, json: { data: entry } });
      }
      return route.fulfill({ status: 200, json: { data: { data: _state.inventoryEntries, total_items: _state.inventoryEntries.length, total_pages: 1 } } });
    }

    // ── Cash Flow ───────────────────────────────────────────────────
    if (url.includes('/cash-flow/summary')) {
      return route.fulfill({ status: 200, json: { data: _state.cashFlowSummary } });
    }
    if (url.includes('/cash-flow')) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        const entry = { id: _state.nextId++, ...body, user: { username: 'admin' } };
        _state.cashFlowEntries.push(entry);
        if (body.type === 'income') _state.cashFlowSummary.total_income += body.amount;
        if (body.type === 'expense') _state.cashFlowSummary.total_expense += body.amount;
        return route.fulfill({ status: 201, json: { data: entry } });
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        _state.cashFlowEntries = _state.cashFlowEntries.filter(e => e.id !== id);
        return route.fulfill({ status: 200, json: { message: 'deleted' } });
      }
      return route.fulfill({ status: 200, json: { data: { data: _state.cashFlowEntries, total_items: _state.cashFlowEntries.length } } });
    }

    // ── Dashboard ───────────────────────────────────────────────────
    if (url.includes('/dashboard')) {
      return route.fulfill({ status: 200, json: { data: _state.dashboard } });
    }

    // ── Reports ─────────────────────────────────────────────────────
    if (url.includes('/reports')) {
      return route.fulfill({ status: 200, json: { data: {} } });
    }
    if (url.includes('/export')) {
      return route.fulfill({ status: 200, body: 'id,name\n1,test', headers: { 'Content-Type': 'text/csv' } });
    }

    // ── Fallback ────────────────────────────────────────────────────
    return route.fulfill({ status: 200, json: { data: [] } });
  });
}

// ─── Login helper ───────────────────────────────────────────────────────
export async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.fill('input[placeholder*="username"]', 'admin');
  await page.fill('input[placeholder*="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/login'));
  await page.waitForLoadState('networkidle');
}
