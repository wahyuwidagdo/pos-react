import { test, expect } from '@playwright/test';

test('debug report data', async ({ request }) => {
  // Login first
  const loginRes = await request.post('http://localhost:3000/api/v1/auth/login', {
    data: {
      username: 'admin',
      password: 'password123'
    }
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  // Fetch report
  const reportRes = await request.get('http://localhost:3000/api/v1/reports/sales?start_date=2024-01-01&end_date=2026-12-31', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  console.log(await reportRes.json());
});
