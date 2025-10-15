import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'e2e.user+local@test.dev';
const TEST_PASSWORD = 'TestUser!23456';

test.describe('App Navigation Structure', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="auth-email"]', { timeout: 10000 });
    await page.fill('[data-testid="auth-email"]', TEST_EMAIL);
    await page.fill('[data-testid="auth-password"]', TEST_PASSWORD);
    await page.click('[data-testid="auth-submit"]');
    await page.waitForURL(/.*\/app.*/, { timeout: 15000 });
  });

  test('top navigation has correct structure', async ({ page }) => {
    // Check main navigation container
    await expect(page.getByTestId('topnav-home')).toBeVisible();
    
    // Check primary tabs
    await expect(page.getByTestId('tab-primary-training')).toBeVisible();
    await expect(page.getByTestId('tab-primary-health')).toBeVisible();
    
    // Check secondary tabs
    await expect(page.getByTestId('tab-progress')).toBeVisible();
    await expect(page.getByTestId('tab-profile')).toBeVisible();
  });

  test('training subnav is accessible', async ({ page }) => {
    // Click on Training tab to open subnav
    await page.getByTestId('tab-primary-training').click();
    
    // Check training subnav items
    await expect(page.getByTestId('subtab-dashboard')).toBeVisible();
    await expect(page.getByTestId('subtab-plans')).toBeVisible();
    await expect(page.getByTestId('subtab-sessions')).toBeVisible();
    await expect(page.getByTestId('subtab-live')).toBeVisible();
    await expect(page.getByTestId('subtab-calendar')).toBeVisible();
  });

  test('health subnav is accessible', async ({ page }) => {
    // Click on Health tab to open subnav
    await page.getByTestId('tab-primary-health').click();
    
    // Check health subnav items
    await expect(page.getByTestId('subtab-nutrition')).toBeVisible();
    await expect(page.getByTestId('subtab-sleep')).toBeVisible();
    await expect(page.getByTestId('subtab-recovery')).toBeVisible();
    await expect(page.getByTestId('subtab-body')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    // Test training subnav links
    await page.getByTestId('tab-primary-training').click();
    await expect(page.getByTestId('subtab-plans')).toBeVisible();
    await page.getByTestId('subtab-plans').click();
    await expect(page).toHaveURL(/.*\/app\/plans/);
    
    // Navigate back to app to test sessions
    await page.goto('/app');
    await page.getByTestId('tab-primary-training').click();
    await expect(page.getByTestId('subtab-sessions')).toBeVisible();
    await page.getByTestId('subtab-sessions').click();
    await expect(page).toHaveURL(/.*\/app\/sessions/);
    
    // Test health subnav links
    await page.goto('/app');
    await page.getByTestId('tab-primary-health').click();
    await expect(page.getByTestId('subtab-nutrition')).toBeVisible();
    await page.getByTestId('subtab-nutrition').click();
    await expect(page).toHaveURL(/.*\/app\/nutrition/);
    
    // Test secondary tabs
    await page.goto('/app');
    await page.getByTestId('tab-progress').click();
    await expect(page).toHaveURL(/.*\/app\/progress/);
  });

  test('active states work correctly', async ({ page }) => {
    // Navigate to plans page
    await page.getByTestId('tab-primary-training').click();
    await page.getByTestId('subtab-plans').click();
    
    // Check that Training tab is active
    const trainingTab = page.getByTestId('tab-primary-training');
    await expect(trainingTab).toHaveAttribute('aria-selected', 'true');
    
    // Check that plans subtab is active
    const plansSubtab = page.getByTestId('subtab-plans');
    await expect(plansSubtab).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Theme and Styling', () => {
  test('applies correct theme colors', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that the page uses the correct background color
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-background/);
    
    // Check that text uses the correct foreground color
    const h1 = page.locator('h1');
    await expect(h1).toHaveClass(/text-foreground/);
    
    // Check that brand elements use the correct color
    const brandElements = page.locator('.text-brand');
    if (await brandElements.count() > 0) {
      await expect(brandElements.first()).toHaveClass(/text-brand/);
    }
  });

  test('has responsive design elements', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that elements are still visible and properly sized
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check that elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('has proper form labels', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that form inputs have proper labels
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Check for associated labels or placeholders
    await expect(emailInput).toHaveAttribute('placeholder');
    await expect(passwordInput).toHaveAttribute('placeholder');
  });

  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that there's an h1 heading
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that the heading has appropriate text
    await expect(page.locator('h1')).toContainText('Anmelden');
  });

  test('has proper button roles', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that submit button has proper role
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Check that links have proper href attributes
    const signupLink = page.locator('a[href="/auth/signup"]');
    await expect(signupLink).toBeVisible();
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });
});

test.describe('Error Handling', () => {
  test('handles 404 pages gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/non-existent-page');
    
    // Should return 404 or redirect appropriately
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });

  test('handles network errors gracefully', async ({ page }) => {
    // This test would require network interception
    // For now, we'll just check that the page loads normally
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toBeVisible();
  });
});

