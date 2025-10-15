import { chromium } from '@playwright/test';

export default async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Bootstrap dev user (idempotent)
  await page.goto('http://localhost:3001/api/dev/bootstrap', { waitUntil: 'load' });

  // Login UI
  await page.goto('http://localhost:3001/auth/login', { waitUntil: 'load' });
  await page.getByTestId('auth-email').fill('test.user@trainr.local');
  await page.getByTestId('auth-password').fill('Trainr!123');
  await page.getByTestId('auth-submit').click();

  // Warte auf App-Dashboard
  await page.waitForURL(/\/app(\/.*)?$/, { timeout: 15000 });

  // Storage sichern
  await page.context().storageState({ path: 'tests/.auth/state.json' });
  await browser.close();
};