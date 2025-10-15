import { chromium } from '@playwright/test';

export default async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Bootstrap dev user (idempotent)
    console.log('Bootstraping dev user...');
    await page.goto('http://localhost:3001/api/dev/bootstrap', { waitUntil: 'load' });
    
    // Check if bootstrap was successful
    const bootstrapResponse = await page.textContent('body');
    console.log('Bootstrap response:', bootstrapResponse);

    // Login UI
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/auth/login', { waitUntil: 'load' });
    
    // Fill login form
    console.log('Filling login form...');
    await page.getByTestId('auth-email').fill('test.user@trainr.local');
    await page.getByTestId('auth-password').fill('Trainr!123');
    
    // Submit form
    console.log('Submitting login form...');
    await page.getByTestId('auth-submit').click();

    // Wait for navigation to app
    console.log('Waiting for app navigation...');
    await page.waitForURL(/\/app(\/.*)?$/, { timeout: 15000 });
    
    console.log('Login successful, current URL:', page.url());

    // Storage sichern
    await page.context().storageState({ path: 'tests/.auth/state.json' });
    console.log('Auth state saved to tests/.auth/state.json');
    
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
};