import { test, expect } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { attachLogging, getStatus } from '../utils/netlog';

const TEST_EMAIL = 'e2e.user+local@test.dev';
const TEST_PASSWORD = 'TestUser!23456';

test.describe('Authentication Flow', () => {
  let errors = [];
  let networkErrors = [];
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    // Reset error collections
    errors = [];
    networkErrors = [];
    consoleErrors = [];

    // Attach robust logging
    attachLogging(page, (msg) => {
      console.log(`[AUTH-TEST] ${msg}`);
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

  test('should signup or login successfully', async ({ page }) => {
    // Try signup first
    await page.goto('/auth/signup');
    
    // Wait for form to be ready
    await page.waitForSelector('[data-testid="signup-email"]', { timeout: 10000 });
    
    // Fill signup form
    await page.fill('[data-testid="signup-email"]', TEST_EMAIL);
    await page.fill('[data-testid="signup-password"]', TEST_PASSWORD);
    
    // Submit form
    await page.click('[data-testid="signup-submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to login (user already exists)
    if (page.url().includes('/auth/login')) {
      console.log('User already exists, proceeding with login');
      
      // Fill login form
      await page.fill('[data-testid="auth-email"]', TEST_EMAIL);
      await page.fill('[data-testid="auth-password"]', TEST_PASSWORD);
      
      // Submit login
      await page.click('[data-testid="auth-submit"]');
      
      // Wait for redirect
      await page.waitForTimeout(2000);
    }
    
    // Expect to be redirected to /app
    await expect(page).toHaveURL(/.*\/app.*/);
    
    // Check that we can see the main navigation
    await expect(page.locator('h1')).toContainText('Trainr App');
    
    // Check for TopNavTabs
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should save auth state', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="auth-email"]');
    
    await page.fill('[data-testid="auth-email"]', TEST_EMAIL);
    await page.fill('[data-testid="auth-password"]', TEST_PASSWORD);
    await page.click('[data-testid="auth-submit"]');
    
    // Wait for successful login
    await page.waitForURL(/.*\/app.*/);
    
    // Save auth state
    await page.context().storageState({ path: 'tests/.auth/state.json' });
    
    console.log('Auth state saved to tests/.auth/state.json');
  });

  test.afterEach(async ({ page }) => {
    // Write error log if any errors occurred
    if (errors.length > 0 || networkErrors.length > 0 || consoleErrors.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = join(process.cwd(), 'ops', 'LOGS', `e2e-auth-${timestamp}.md`);
      
      // Ensure logs directory exists
      const logsDir = join(process.cwd(), 'ops', 'LOGS');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }
      
      const logContent = `# E2E Auth Test Errors - ${timestamp}

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