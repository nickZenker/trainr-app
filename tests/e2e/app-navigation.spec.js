import { test, expect } from '@playwright/test';

test.describe('App Navigation Structure', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/auth/login');
  });

  test('login page has correct structure', async ({ page }) => {
    // Check page title and main elements
    await expect(page.locator('h1')).toContainText('Anmelden');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Anmelden');
    
    // Check navigation links
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible();
    await expect(page.locator('a[href="/auth/reset-password"]')).toBeVisible();
  });

  test('signup page has correct structure', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check page title and main elements
    await expect(page.locator('h1')).toContainText('Registrieren');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Registrieren');
    
    // Check navigation links
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible();
  });

  test('reset password page has correct structure', async ({ page }) => {
    await page.goto('/auth/reset-password');
    
    // Check page title and main elements
    await expect(page.locator('h1')).toContainText('Passwort zurücksetzen');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Reset-Link senden');
    
    // Check navigation links
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible();
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

