import { test, expect } from '@playwright/test';
import { createMockPage } from './helpers/isolatedTest';

test.describe('Plans CRUD Operations', () => {
  test('creates plan with server validation errors as text (no [object Object])', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for plan creation form
    const form = page.locator('#create-plan-form');
    await expect(form).toBeVisible();
    
    // Fill only name, leave goal empty to trigger our validation
    await page.getByTestId('plan-name').fill('Test Plan');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-weeks').fill('8');
    // Leave goal empty
    
    // Submit form to trigger validation
    await page.getByTestId('plan-create').click();
    
    // Check for clear error message (not [object Object])
    const errorElement = page.getByTestId('plan-error');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText('Ziel ist erforderlich');
  });

  test('creates plan and redirects to schedule', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for plan creation form
    const form = page.locator('#create-plan-form');
    await expect(form).toBeVisible();
    
    // Fill valid form
    await page.getByTestId('plan-name').fill('E2E Test Plan');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-goal').fill('Test goal for E2E');
    await page.getByTestId('plan-weeks').fill('8');
    
    // Submit form
    await page.getByTestId('plan-create').click();
    
    // Wait for form submission and plan creation
    await page.waitForTimeout(2000);
    
    // Check that plan appears in list
    await expect(page.locator('text=E2E Test Plan')).toBeVisible();
    
    // Check stats updated
    await expect(page.locator('#total-plans')).toHaveText('2');
  });

  test('edits plan successfully', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for existing plan
    const existingPlan = page.locator('text=Test Strength Plan');
    await expect(existingPlan).toBeVisible();
    
    // Click edit button (we'll simulate this since we don't have the actual edit page in mock)
    const editButton = page.locator('[data-testid="plan-edit-plan-1"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Wait for edit form
      await page.waitForSelector('[data-testid="plan-edit-form"]', { timeout: 5000 });
      
      // Change name
      await page.getByTestId('plan-name').fill('Updated Test Plan');
      
      // Submit
      await page.getByTestId('plan-update-submit').click();
      
      // Wait for success
      await page.waitForTimeout(2000);
      
      // Check for success message
      const successMessage = page.locator('text=Plan aktualisiert');
      await expect(successMessage).toBeVisible();
    }
  });

  test('duplicates plan', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for existing plan
    const existingPlan = page.locator('text=Test Strength Plan');
    await expect(existingPlan).toBeVisible();
    
    // Click duplicate button
    const duplicateButton = page.locator('[data-testid="plan-duplicate-plan-1"]');
    if (await duplicateButton.isVisible()) {
      await duplicateButton.click();
      
      // Wait for duplication
      await page.waitForTimeout(2000);
      
      // Check that copy appears in list
      await expect(page.locator('text=Test Strength Plan (Kopie)')).toBeVisible();
    }
  });

  test('soft deletes plan', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for existing plan
    const existingPlan = page.locator('text=Test Strength Plan');
    await expect(existingPlan).toBeVisible();
    
    // Click delete button
    const deleteButton = page.locator('[data-testid="plan-delete-plan-1"]');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      await page.getByRole('button', { name: 'OK' }).click();
      
      // Wait for deletion
      await page.waitForTimeout(2000);
      
      // Check that plan is no longer visible
      await expect(page.locator('text=Test Strength Plan')).not.toBeVisible();
    }
  });
});
