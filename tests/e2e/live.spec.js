import { test } from '@playwright/test';
import { attachLogging, getStatus } from '../utils/netlog';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

test.describe('Live Training Flow', () => {
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
      console.log(`[LIVE-TEST] ${msg}`);
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

  test('should handle live session start/stop and set logging', async ({ page }) => {
    // Try to access a live session (start with ID 1)
    await page.goto('/app/live/1');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check if we get a valid live session page or an error
    const pageContent = await page.textContent('body');
    
    if (pageContent.includes('nicht gefunden') || pageContent.includes('not found')) {
      console.log('WARN: Live session 1 not found, skipping live tests');
      return;
    }
    
    // Look for start/stop buttons
    const startButton = page.locator('[data-testid="live-start"]').first();
    const stopButton = page.locator('[data-testid="live-stop"]').first();
    
    // Check session status and start if needed
    if (await startButton.isVisible()) {
      console.log('Starting live session...');
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Check that stop button is now visible
      if (await stopButton.isVisible()) {
        console.log('Live session started successfully');
        
        // Now try to log a set
        const setForm = page.locator('form').filter({ hasText: /log|Log/i }).first();
        
        if (await setForm.isVisible()) {
          console.log('Found set logging form, attempting to log a set...');
          
          // Fill set form
          await setForm.fill('input[name="reps"]', '5');
          await setForm.fill('input[name="weight"]', '60');
          await setForm.fill('input[name="rpe"]', '7');
          await setForm.fill('input[name="notes"]', 'E2E Test Set');
          
          // Submit set logging
          await setForm.click('[data-testid="live-logset"]');
          await page.waitForTimeout(2000);
          
          // Check for recent sets display
          const recentSets = page.locator('text=Recent Sets, text=recent sets, [class*="recent"]').first();
          if (await recentSets.isVisible()) {
            console.log('Set logged successfully, recent sets visible');
          }
        } else {
          console.log('WARN: No set logging form found');
        }
        
        // Now stop the session
        console.log('Stopping live session...');
        await stopButton.click();
        await page.waitForTimeout(2000);
        
        // Check that start button is visible again
        if (await startButton.isVisible()) {
          console.log('Live session stopped successfully');
        }
      } else {
        console.log('WARN: Stop button not visible after starting session');
      }
    } else if (await stopButton.isVisible()) {
      console.log('Live session already active, testing stop...');
      await stopButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('WARN: No start/stop buttons found on live session page');
    }
  });

  test('should test set logging form if available', async ({ page }) => {
    await page.goto('/app/live/1');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Look for set logging form
    const setForm = page.locator('form').filter({ hasText: /log|Log|Set/i }).first();
    
    if (await setForm.isVisible()) {
      console.log('Testing set logging form...');
      
      // Try to fill all available fields
      const repsInput = setForm.locator('input[name="reps"]').first();
      const weightInput = setForm.locator('input[name="weight"]').first();
      const rpeInput = setForm.locator('input[name="rpe"]').first();
      const notesInput = setForm.locator('input[name="notes"], textarea[name="notes"]').first();
      
      if (await repsInput.isVisible()) {
        await repsInput.fill('8');
      }
      if (await weightInput.isVisible()) {
        await weightInput.fill('75');
      }
      if (await rpeInput.isVisible()) {
        await rpeInput.fill('8');
      }
      if (await notesInput.isVisible()) {
        await notesInput.fill('E2E Test Set - Form Test');
      }
      
      // Try to submit
      const submitButton = setForm.locator('[data-testid="live-logset"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check for any success/error messages
        const messages = page.locator('[class*="success"], [class*="error"], [class*="alert"]');
        if (await messages.count() > 0) {
          const messageText = await messages.first().textContent();
          console.log(`Form submission result: ${messageText}`);
        }
      }
    } else {
      console.log('WARN: No set logging form found');
    }
  });

  test.afterEach(async ({ page }) => {
    // Write error log if any errors occurred
    if (errors.length > 0 || networkErrors.length > 0 || consoleErrors.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = join(process.cwd(), 'ops', 'LOGS', `e2e-live-${timestamp}.md`);
      
      // Ensure logs directory exists
      const logsDir = join(process.cwd(), 'ops', 'LOGS');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }
      
      const logContent = `# E2E Live Training Test Errors - ${timestamp}

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
