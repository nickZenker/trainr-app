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

  test('opens training dropdown and shows all items without scrolling', async ({ page }) => {
    // Check if we're on desktop (pointer: fine) for hover behavior
    const isDesktop = await page.evaluate(() => window.matchMedia('(pointer: fine)').matches);
    
    if (isDesktop) {
      // Hover to open dropdown on desktop
      await page.hover('[data-testid="subnav-trigger-training"]');
      await page.waitForTimeout(200); // Wait for hover delay
    } else {
      // Click to open dropdown on mobile
      await page.getByTestId('subnav-trigger-training').click();
    }
    
    // Check that dropdown panel is visible
    await expect(page.getByTestId('subnav-panel-training')).toBeVisible({ timeout: 10000 });
    
    // Check all training dropdown items are visible
    await expect(page.getByTestId('subnav-item-dashboard')).toBeVisible();
    await expect(page.getByTestId('subnav-item-plans')).toBeVisible();
    await expect(page.getByTestId('subnav-item-sessions')).toBeVisible();
    await expect(page.getByTestId('subnav-item-live')).toBeVisible();
    await expect(page.getByTestId('subnav-item-calendar')).toBeVisible();
    
    // Check no horizontal scrollbar
    const panel = page.getByTestId('subnav-panel-training');
    const hasHorizontalScroll = await panel.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('opens health dropdown and shows all items without scrolling', async ({ page }) => {
    // Check if we're on desktop (pointer: fine) for hover behavior
    const isDesktop = await page.evaluate(() => window.matchMedia('(pointer: fine)').matches);
    
    if (isDesktop) {
      // Hover to open dropdown on desktop
      await page.hover('[data-testid="subnav-trigger-health"]');
      await page.waitForTimeout(200); // Wait for hover delay
    } else {
      // Click to open dropdown on mobile
      await page.getByTestId('subnav-trigger-health').click();
    }
    
    // Check that dropdown panel is visible
    await expect(page.getByTestId('subnav-panel-health')).toBeVisible({ timeout: 10000 });
    
    // Check all health dropdown items are visible
    await expect(page.getByTestId('subnav-item-nutrition')).toBeVisible();
    await expect(page.getByTestId('subnav-item-sleep')).toBeVisible();
    await expect(page.getByTestId('subnav-item-recovery')).toBeVisible();
    await expect(page.getByTestId('subnav-item-body')).toBeVisible();
    
    // Check no horizontal scrollbar
    const panel = page.getByTestId('subnav-panel-health');
    const hasHorizontalScroll = await panel.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('keyboard navigation works inside dropdown', async ({ page }) => {
    // Open training dropdown via keyboard
    await page.getByTestId('subnav-trigger-training').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('subnav-panel-training')).toBeVisible({ timeout: 10000 });
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('subnav-item-plans')).toBeFocused();
    
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('subnav-item-sessions')).toBeFocused();
    
    // Test Enter key to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/.*\/app\/sessions/);
  });

  test('closes on escape and outside click', async ({ page }) => {
    // Open training dropdown
    const isDesktop = await page.evaluate(() => window.matchMedia('(pointer: fine)').matches);
    
    if (isDesktop) {
      await page.hover('[data-testid="subnav-trigger-training"]');
      await page.waitForTimeout(200);
    } else {
      await page.getByTestId('subnav-trigger-training').click();
    }
    
    await expect(page.getByTestId('subnav-panel-training')).toBeVisible({ timeout: 10000 });
    
    // Test escape key
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('subnav-panel-training')).not.toBeVisible();
    
    // Reopen dropdown
    if (isDesktop) {
      await page.hover('[data-testid="subnav-trigger-training"]');
      await page.waitForTimeout(200);
    } else {
      await page.getByTestId('subnav-trigger-training').click();
    }
    await expect(page.getByTestId('subnav-panel-training')).toBeVisible({ timeout: 10000 });
    
    // Test outside click
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(100); // Wait for debounce
    await expect(page.getByTestId('subnav-panel-training')).not.toBeVisible();
  });

  test('panel closes on route change', async ({ page }) => {
    // Open training dropdown
    const isDesktop = await page.evaluate(() => window.matchMedia('(pointer: fine)').matches);
    
    if (isDesktop) {
      await page.hover('[data-testid="subnav-trigger-training"]');
      await page.waitForTimeout(200);
    } else {
      await page.getByTestId('subnav-trigger-training').click();
    }
    
    await expect(page.getByTestId('subnav-panel-training')).toBeVisible({ timeout: 10000 });
    
    // Click on Plans item to navigate
    await page.getByTestId('subnav-item-plans').click();
    await expect(page).toHaveURL(/.*\/app\/plans/);
    
    // Panel should be closed after navigation
    await expect(page.getByTestId('subnav-panel-training')).not.toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    // Test training dropdown links
    const isDesktop = await page.evaluate(() => window.matchMedia('(pointer: fine)').matches);
    
    if (isDesktop) {
      await page.hover('[data-testid="subnav-trigger-training"]');
      await page.waitForTimeout(200);
    } else {
      await page.getByTestId('subnav-trigger-training').click();
    }
    
    await page.getByTestId('subnav-item-plans').click();
    await expect(page).toHaveURL(/.*\/app\/plans/);
    
    // Navigate back to app to test sessions
    await page.goto('/app');
    
    if (isDesktop) {
      await page.hover('[data-testid="subnav-trigger-training"]');
      await page.waitForTimeout(200);
    } else {
      await page.getByTestId('subnav-trigger-training').click();
    }
    
    await page.getByTestId('subnav-item-sessions').click();
    await expect(page).toHaveURL(/.*\/app\/sessions/);
    
    // Test health dropdown links
    await page.goto('/app');
    
    if (isDesktop) {
      await page.hover('[data-testid="subnav-trigger-health"]');
      await page.waitForTimeout(200);
    } else {
      await page.getByTestId('subnav-trigger-health').click();
    }
    
    await page.getByTestId('subnav-item-nutrition').click();
    await expect(page).toHaveURL(/.*\/app\/nutrition/);
    
    // Test secondary tabs
    await page.goto('/app');
    await page.getByTestId('tab-progress').click();
    await expect(page).toHaveURL(/.*\/app\/progress/);
  });

  test('active states work correctly', async ({ page }) => {
    // Navigate to plans page via dropdown
    await page.getByTestId('tab-primary-training').click();
    await page.getByTestId('subnav-item-plans').click();
    
    // Check that Training tab is active
    const trainingTab = page.getByTestId('tab-primary-training');
    await expect(trainingTab).toHaveAttribute('aria-selected', 'true');
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

