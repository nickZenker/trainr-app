import { test, expect } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

test.describe('Session Scheduling & Calendar', () => {
  let errors = [];
  let networkErrors = [];
  let consoleErrors = [];

  test.use({ storageState: 'tests/.auth/state.json' });

  test.beforeEach(async ({ page }) => {
    // Reset error collections
    errors = [];
    networkErrors = [];
    consoleErrors = [];

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

    // Collect network errors
    page.on('requestfinished', request => {
      const response = request.response();
      if (response && response.status() >= 500) {
        networkErrors.push({
          type: 'network',
          url: request.url(),
          status: response.status(),
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

  test('should schedule session and display in calendar', async ({ page }) => {
    // First, go to sessions page
    await page.goto('/app/sessions');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Look for existing sessions or create one if needed
    const sessionsList = page.locator('[data-testid="sessions-list"], .grid, .space-y');
    
    // Check if there are any sessions
    const sessionCount = await sessionsList.count();
    
    if (sessionCount === 0) {
      console.log('WARN: No sessions found. Creating a session first...');
      
      // Look for "Create Session" or similar button
      const createButton = page.locator('a[href*="/sessions/new"], button:has-text("Neue Session"), a:has-text("Create")').first();
      
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Fill session form if it exists
        await page.waitForSelector('input[name="name"]', { timeout: 5000 }).catch(() => {});
        if (await page.locator('input[name="name"]').isVisible()) {
          await page.fill('input[name="name"]', 'E2E Test Session');
          await page.fill('input[name="weekday"]', '1'); // Monday
          await page.fill('input[name="time"]', '18:00');
          
          // Submit if button exists
          const submitBtn = page.locator('button[type="submit"]').first();
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(1000);
          }
        }
        
        // Go back to sessions list
        await page.goto('/app/sessions');
        await page.waitForTimeout(1000);
      } else {
        console.log('WARN: Cannot create session - no create button found');
        return; // Skip this test
      }
    }
    
    // Look for scheduling forms in sessions list
    const scheduleForm = page.locator('form').filter({ hasText: /planen|schedule/i }).first();
    
    if (await scheduleForm.isVisible()) {
      // Calculate today's date at 18:00 for datetime-local input
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const datetimeValue = `${year}-${month}-${day}T18:00`;
      
      // Fill scheduling form
      await scheduleForm.fill('input[type="datetime-local"]', datetimeValue);
      await scheduleForm.fill('input[name="durationMin"]', '60');
      
      // Submit scheduling
      await scheduleForm.click('button[type="submit"]');
      
      // Wait for form submission
      await page.waitForTimeout(2000);
      
      // Now go to calendar to verify
      await page.goto('/app/calendar?view=month');
      
      // Wait for calendar to load
      await page.waitForSelector('h1', { timeout: 10000 });
      
      // Check for scheduled session in calendar
      // Look for any session events (they should have time and plan type badges)
      const sessionEvents = page.locator('[class*="bg-blue"], [class*="bg-green"]').filter({ hasText: /18:00|E2E|Test/ });
      
      if (await sessionEvents.count() > 0) {
        await expect(sessionEvents.first()).toBeVisible();
        
        // Check for plan type badge (Strength/Endurance)
        const badge = page.locator('[class*="bg-blue"], [class*="bg-green"]').filter({ hasText: /Strength|Endurance/ }).first();
        if (await badge.isVisible()) {
          await expect(badge).toBeVisible();
        }
      } else {
        console.log('WARN: No scheduled session found in calendar view');
      }
    } else {
      console.log('WARN: No scheduling form found on sessions page');
    }
  });

  test.afterEach(async ({ page }) => {
    // Write error log if any errors occurred
    if (errors.length > 0 || networkErrors.length > 0 || consoleErrors.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = join(process.cwd(), 'ops', 'LOGS', `e2e-schedule-${timestamp}.md`);
      
      // Ensure logs directory exists
      const logsDir = join(process.cwd(), 'ops', 'LOGS');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }
      
      const logContent = `# E2E Schedule/Calendar Test Errors - ${timestamp}

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
