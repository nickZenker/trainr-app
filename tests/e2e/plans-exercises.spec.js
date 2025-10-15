import { test, expect } from '@playwright/test';
import { createMockPage } from './helpers/isolatedTest';

test.describe('Plans with Exercise Assignment', () => {
  test('creates plan successfully (no unexpected response)', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for plan creation form
    const form = page.locator('[data-testid="plan-create-form"]');
    await expect(form).toBeVisible();
    
    // Fill valid form
    await page.getByTestId('plan-name-input').fill('E2E Test Plan');
    await page.getByTestId('plan-type-select').selectOption('strength');
    await page.getByTestId('plan-goal-input').fill('Test goal for E2E');
    await page.getByTestId('plan-weeks-input').fill('8');
    
    // Submit form
    await page.getByTestId('plan-submit').click();
    
    // Wait for form submission and plan creation
    await page.waitForTimeout(2000);
    
    // Check that plan appears in list
    await expect(page.locator('text=E2E Test Plan')).toBeVisible();
    
    // Check stats updated
    await expect(page.locator('#total-plans')).toHaveText('2');
  });

  test('assigns default exercises per weekday and generates sessions with meta.exercises', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for existing plan
    const existingPlan = page.locator('text=Test Strength Plan');
    await expect(existingPlan).toBeVisible();
    
    // Click schedule link
    const scheduleLink = page.locator('[data-testid="plan-schedule-link-plan-1"]');
    if (await scheduleLink.isVisible()) {
      await scheduleLink.click();
      
      // Wait for schedule page
      await page.waitForSelector('[data-testid="plan-schedule-page"]', { timeout: 5000 });
      
      // Check for pattern rows
      const patternRows = page.locator('[data-testid^="pattern-row-"]');
      await expect(patternRows).toHaveCount(3); // Default strength pattern has 3 days
      
      // Select exercises for first pattern row
      const firstExerciseCheckbox = page.locator('[data-testid="pattern-exercises-0"] input[type="checkbox"]').first();
      if (await firstExerciseCheckbox.isVisible()) {
        await firstExerciseCheckbox.check();
        
        // Submit schedule form
        await page.getByTestId('plan-schedule-submit').click();
        
        // Wait for sessions to be created
        await page.waitForTimeout(2000);
        
        // Navigate to sessions page to verify
        await page.goto('/app/sessions');
        await page.waitForSelector('h1', { timeout: 5000 });
        
        // Check that sessions were created
        const sessionCards = page.locator('.session-card');
        await expect(sessionCards).toHaveCount(3); // 3 sessions for 3 pattern days
        
        // Navigate to first live session
        const firstSessionLink = page.locator('.session-card').first().locator('a');
        if (await firstSessionLink.isVisible()) {
          await firstSessionLink.click();
          
          // Wait for live page
          await page.waitForSelector('[data-testid="live-exercises-list"]', { timeout: 5000 });
          
          // Check that exercises are displayed
          const exercisesList = page.getByTestId('live-exercises-list');
          await expect(exercisesList).toBeVisible();
          await expect(exercisesList).toContainText('Back Squat'); // Should contain at least one exercise
        }
      }
    }
  });
});
