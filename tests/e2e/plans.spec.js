import { test, expect } from '@playwright/test';
import { attachLogging, getStatus } from '../utils/netlog';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

test.describe('Plans Creation', () => {
  let errors = [];
  let networkErrors = [];
  let consoleErrors = [];

  test.use({ storageState: 'tests/.auth/state.json' });

  test.beforeEach(async ({ page }) => {
    // Reset error collections
    errors = [];
    networkErrors = [];
    consoleErrors = [];

    // Attach robust logging
    attachLogging(page, (msg) => {
      console.log(`[PLANS-TEST] ${msg}`);
    });

    // Collect console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'console',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Collect page errors
    page.on('pageerror', error => {
      consoleErrors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Collect network errors with robust status checking
    page.on('requestfinished', request => {
      const response = request.response();
      const status = getStatus(response);
      if (response && status >= 500) {
        networkErrors.push({
          type: 'network',
          url: request.url(),
          status: status,
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });

    page.on('requestfailed', request => {
      networkErrors.push({
        type: 'requestfailed',
        url: request.url(),
        failure: request.failure()?.errorText,
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
  });

  test('should create strength plan', async ({ page }) => {
    await page.goto('/app/plans');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Look for plan creation form
    const form = page.locator('form').filter({ hasText: /name.*type/i }).first();
    await expect(form).toBeVisible();
    
    // Fill strength plan form
    await form.fill('[data-testid="plan-name"]', 'E2E Kraft – PPL');
    await form.selectOption('[data-testid="plan-type"]', 'strength');
    await form.fill('[data-testid="plan-description"]', 'E2E Test Plan für Push/Pull/Legs');
    
    // Submit form
    await form.click('[data-testid="plan-create"]');
    
    // Wait for form submission
    await page.waitForTimeout(2000);
    
    // Check that plan appears in list
    await expect(page.locator('text=E2E Kraft – PPL')).toBeVisible();
    
    // Check for strength badge
    await expect(page.locator('text=Strength')).toBeVisible();
  });

  test('should create endurance plan', async ({ page }) => {
    await page.goto('/app/plans');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Look for plan creation form
    const form = page.locator('form').filter({ hasText: /name.*type/i }).first();
    await expect(form).toBeVisible();
    
    // Fill endurance plan form
    await form.fill('[data-testid="plan-name"]', 'E2E Ausdauer – 10k');
    await form.selectOption('[data-testid="plan-type"]', 'endurance');
    await form.fill('[data-testid="plan-description"]', 'E2E Test Plan für 10k Aufbau');
    
    // Submit form
    await form.click('[data-testid="plan-create"]');
    
    // Wait for form submission
    await page.waitForTimeout(2000);
    
    // Check that plan appears in list
    await expect(page.locator('text=E2E Ausdauer – 10k')).toBeVisible();
    
    // Check for endurance badge
    await expect(page.locator('text=Endurance')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Write error log if any errors occurred
    if (errors.length > 0 || networkErrors.length > 0 || consoleErrors.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = join(process.cwd(), 'ops', 'LOGS', `e2e-plans-${timestamp}.md`);
      
      // Ensure logs directory exists
      const logsDir = join(process.cwd(), 'ops', 'LOGS');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }
      
      const logContent = `# E2E Plans Test Errors - ${timestamp}

## Test Results
- URL: ${page.url()}
- Title: ${await page.title()}

## Network Errors (5xx)
${networkErrors.length > 0 ? networkErrors.map(err => 
  `- ${err.method} ${err.url} → ${err.status || 'FAILED'} (${err.timestamp})`
).join('\n') : 'None'}

## Console Errors
${consoleErrors.length > 0 ? consoleErrors.map(err => 
  `- ${err.type}: ${err.message} (${err.timestamp})`
).join('\n') : 'None'}

## General Errors
${errors.length > 0 ? errors.map(err => 
  `- ${err.message} (${err.timestamp})`
).join('\n') : 'None'}
`;
      
      writeFileSync(logFile, logContent);
      console.log(`Error log written to: ${logFile}`);
    }
  });
});
