import { test, expect } from '@playwright/test';

test.describe('Plan Scheduling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to plans page
    await page.goto('/app/plans');
  });

  test('creates sessions from plan pattern', async ({ page }) => {
    // Fill plan creation form
    await page.getByTestId('plan-name').fill('Test Strength Plan');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-description').fill('Test plan for scheduling');
    
    // Submit plan creation
    await page.getByTestId('plan-create').click();
    
    // Should redirect to schedule page
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
    
    // Check that default pattern is visible (should have at least 1 row)
    const patternRows = page.locator('[data-testid^="pattern-row-"]');
    await expect(patternRows).toHaveCount(3); // Default strength pattern has 3 days
    
    // Verify default pattern content
    await expect(page.locator('[data-testid="pattern-row-0"] select')).toHaveValue('1'); // Monday
    await expect(page.locator('[data-testid="pattern-row-0"] input[type="time"]')).toHaveValue('18:00');
    
    // Change start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await page.getByTestId('plan-schedule-start').fill(tomorrowStr);
    
    // Submit scheduling
    await page.getByTestId('plan-schedule-submit').click();
    
    // Should show success toast
    await expect(page.locator('text=Termine erzeugt')).toBeVisible({ timeout: 10000 });
    
    // Should redirect to calendar
    await expect(page).toHaveURL('/app/calendar');
    
    // Verify sessions were created by checking calendar content
    // Look for session elements or text indicating sessions exist
    await expect(page.locator('text=Strength Training')).toBeVisible({ timeout: 5000 });
  });

  test('validation prevents empty pattern', async ({ page }) => {
    // Create a plan first
    await page.getByTestId('plan-name').fill('Test Plan');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-create').click();
    
    // Wait for redirect to schedule page
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
    
    // Remove all pattern rows
    const removeButtons = page.locator('[data-testid^="pattern-remove-"]');
    const count = await removeButtons.count();
    
    for (let i = count - 1; i >= 0; i--) {
      await removeButtons.nth(i).click();
    }
    
    // Try to submit with empty pattern
    await page.getByTestId('plan-schedule-submit').click();
    
    // Should show validation error
    await expect(page.locator('text=Bitte mindestens einen Wochentag hinzufügen')).toBeVisible({ timeout: 5000 });
  });

  test('can add and remove pattern rows', async ({ page }) => {
    // Create a plan first
    await page.getByTestId('plan-name').fill('Test Plan');
    await page.getByTestId('plan-type').selectOption('endurance');
    await page.getByTestId('plan-create').click();
    
    // Wait for redirect to schedule page
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
    
    // Check initial pattern (endurance has 3 default rows)
    await expect(page.locator('[data-testid^="pattern-row-"]')).toHaveCount(3);
    
    // Add a new pattern row
    await page.getByTestId('pattern-add').click();
    
    // Should have 4 rows now
    await expect(page.locator('[data-testid^="pattern-row-"]')).toHaveCount(4);
    
    // Remove the last row
    await page.getByTestId('pattern-remove-3').click();
    
    // Should have 3 rows again
    await expect(page.locator('[data-testid^="pattern-row-"]')).toHaveCount(3);
  });

  test('validates time format', async ({ page }) => {
    // Create a plan first
    await page.getByTestId('plan-name').fill('Test Plan');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-create').click();
    
    // Wait for redirect to schedule page
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
    
    // Enter invalid time format
    await page.locator('[data-testid="pattern-row-0"] input[type="time"]').fill('25:00');
    
    // Try to submit
    await page.getByTestId('plan-schedule-submit').click();
    
    // Should show validation error
    await expect(page.locator('text=Bitte gültige Zeit im Format HH:MM eingeben')).toBeVisible({ timeout: 5000 });
  });

  test('validates weeks input', async ({ page }) => {
    // Create a plan first
    await page.getByTestId('plan-name').fill('Test Plan');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-create').click();
    
    // Wait for redirect to schedule page
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
    
    // Enter invalid weeks
    await page.getByTestId('plan-schedule-weeks').fill('0');
    
    // Try to submit
    await page.getByTestId('plan-schedule-submit').click();
    
    // Should show validation error
    await expect(page.locator('text=Wochenanzahl muss zwischen 1 und 52 liegen')).toBeVisible({ timeout: 5000 });
  });

  test('schedule link appears in plan list', async ({ page }) => {
    // Create a plan first
    await page.getByTestId('plan-name').fill('Test Plan for Link');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-create').click();
    
    // Wait for redirect to schedule page, then go back to plans
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
    await page.goto('/app/plans');
    
    // Look for the schedule link
    const scheduleLink = page.locator('[data-testid^="plan-schedule-link-"]').first();
    await expect(scheduleLink).toBeVisible();
    await expect(scheduleLink).toHaveText('Einplanen');
    
    // Click the schedule link
    await scheduleLink.click();
    
    // Should navigate to schedule page
    await expect(page).toHaveURL(/\/app\/plans\/[^\/]+\/schedule/);
  });
});
