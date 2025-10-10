import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/login');
    
    // Should show login form
    await expect(page.locator('h1')).toContainText('Anmelden');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows signup link and navigation', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Should have link to signup
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible();
    
    // Should have link to reset password
    await expect(page.locator('a[href="/auth/reset-password"]')).toBeVisible();
  });

  test('navigates to signup page', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click signup link
    await page.click('a[href="/auth/signup"]');
    
    // Should be on signup page
    await expect(page).toHaveURL('/auth/signup');
    await expect(page.locator('h1')).toContainText('Registrieren');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('navigates to reset password page', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click reset password link
    await page.click('a[href="/auth/reset-password"]');
    
    // Should be on reset password page
    await expect(page).toHaveURL('/auth/reset-password');
    await expect(page.locator('h1')).toContainText('Passwort zurücksetzen');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('redirects from root to login', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });

  test('redirects from app routes to login when not authenticated', async ({ page }) => {
    const protectedRoutes = [
      '/app',
      '/app/plans',
      '/app/sessions', 
      '/app/profile',
      '/app/routes'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/auth/login');
    }
  });

  test('login form validation', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors (depending on implementation)
    // This test assumes HTML5 validation or custom validation is in place
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message (this depends on your error handling implementation)
    // For now, we'll just check that we're still on the login page
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('App Navigation (requires authentication)', () => {
  // These tests would require actual authentication
  // For now, we'll create placeholder tests that can be extended
  
  test.skip('redirects to app dashboard when authenticated', async ({ page }) => {
    // This test would need to be implemented with actual authentication
    // or with a test user setup
    await page.goto('/');
    // Should redirect to /app when authenticated
  });

  test.skip('shows logout button when authenticated', async ({ page }) => {
    // This test would need authentication setup
    await page.goto('/app');
    // Should show logout button
  });

  test.skip('logout redirects to login', async ({ page }) => {
    // This test would need authentication setup
    await page.goto('/app');
    // Click logout
    // Should redirect to login
  });
});
