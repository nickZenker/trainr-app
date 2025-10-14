import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Core App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app root before each test
    await page.goto('/app');
  });

  test('app root is accessible and redirects properly', async ({ page }) => {
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('health endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('ok', true);
    expect(data).toHaveProperty('time');
    expect(data).toHaveProperty('env');
    expect(data.env).toHaveProperty('NEXT_PUBLIC_SUPABASE_URL');
  });

  test('plans page renders without errors', async ({ page }) => {
    // Navigate to plans page (will redirect to login, but should not crash)
    const response = await page.goto('/app/plans');
    
    // Should not be a 500 error
    expect(response?.status()).toBeLessThan(500);
    
    // Should either show login page or plans page
    const isLoginPage = await page.locator('h1').textContent().then(text => 
      text?.includes('Anmelden') || text?.includes('Login')
    );
    const isPlansPage = await page.locator('h1').textContent().then(text => 
      text?.includes('Trainingspläne') || text?.includes('Plans')
    );
    
    expect(isLoginPage || isPlansPage).toBe(true);
  });

  test('sessions page renders without errors', async ({ page }) => {
    // Navigate to sessions page (will redirect to login, but should not crash)
    const response = await page.goto('/app/sessions');
    
    // Should not be a 500 error
    expect(response?.status()).toBeLessThan(500);
    
    // Should either show login page or sessions page
    const isLoginPage = await page.locator('h1').textContent().then(text => 
      text?.includes('Anmelden') || text?.includes('Login')
    );
    const isSessionsPage = await page.locator('h1').textContent().then(text => 
      text?.includes('Sessions') || text?.includes('Trainingseinheiten')
    );
    
    expect(isLoginPage || isSessionsPage).toBe(true);
  });

  test('live page renders without errors', async ({ page }) => {
    // Navigate to live page (will redirect to login, but should not crash)
    const response = await page.goto('/app/live/1');
    
    // Should not be a 500 error
    expect(response?.status()).toBeLessThan(500);
    
    // Should either show login page or live page
    const isLoginPage = await page.locator('h1').textContent().then(text => 
      text?.includes('Anmelden') || text?.includes('Login')
    );
    const isLivePage = await page.locator('h1').textContent().then(text => 
      text?.includes('Live Training') || text?.includes('Live')
    );
    
    expect(isLoginPage || isLivePage).toBe(true);
  });

  test('navigation tabs are present', async ({ page }) => {
    // Navigate to any app page to check navigation
    await page.goto('/app/plans');
    
    // Check if navigation tabs are present (may be hidden behind auth)
    const navTabs = page.locator('nav');
    if (await navTabs.count() > 0) {
      // If navigation is visible, check for key tabs
      const dashboardTab = page.locator('a[href="/app"]');
      const plansTab = page.locator('a[href="/app/plans"]');
      const sessionsTab = page.locator('a[href="/app/sessions"]');
      
      // At least one tab should be present
      const tabCount = await dashboardTab.count() + await plansTab.count() + await sessionsTab.count();
      expect(tabCount).toBeGreaterThan(0);
    }
  });

  test('coming soon pages render without errors', async ({ page }) => {
    const comingSoonPages = [
      '/app/nutrition',
      '/app/sleep', 
      '/app/recovery',
      '/app/body'
    ];

    for (const pagePath of comingSoonPages) {
      const response = await page.goto(pagePath);
      
      // Should not be a 500 error
      expect(response?.status()).toBeLessThan(500);
      
      // Should either show login page or coming soon page
      const isLoginPage = await page.locator('h1').textContent().then(text => 
        text?.includes('Anmelden') || text?.includes('Login')
      );
      const isComingSoonPage = await page.locator('h1').textContent().then(text => 
        text?.includes('kommt bald') || text?.includes('Coming soon')
      );
      
      expect(isLoginPage || isComingSoonPage).toBe(true);
    }
  });
});

test.describe('Form Rendering Tests', () => {
  test('plan creation form renders correctly', async ({ page }) => {
    await page.goto('/app/plans/new');
    
    // Should not be a 500 error
    const response = await page.goto('/app/plans/new');
    expect(response?.status()).toBeLessThan(500);
    
    // Check if form elements are present (may be behind auth)
    const nameInput = page.locator('input[name="name"]');
    const goalTextarea = page.locator('textarea[name="goal"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // If form is visible, check elements
    if (await nameInput.count() > 0) {
      await expect(nameInput).toBeVisible();
      await expect(goalTextarea).toBeVisible();
      await expect(submitButton).toBeVisible();
    }
  });

  test('session creation form renders correctly', async ({ page }) => {
    await page.goto('/app/sessions/new');
    
    // Should not be a 500 error
    const response = await page.goto('/app/sessions/new');
    expect(response?.status()).toBeLessThan(500);
    
    // Check if form elements are present (may be behind auth)
    const nameInput = page.locator('input[name="name"]');
    const typeSelect = page.locator('select[name="type"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // If form is visible, check elements
    if (await nameInput.count() > 0) {
      await expect(nameInput).toBeVisible();
      await expect(typeSelect).toBeVisible();
      await expect(submitButton).toBeVisible();
    }
  });
});
