import { test, expect } from '@playwright/test';
import { attachLogging, getStatus } from '../utils/netlog';
import { pipePageConsole } from './helpers/consoleTap';
import { createMockPage } from './helpers/isolatedTest';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

test.describe('Plans Creation', () => {
  let errors = [];
  let networkErrors = [];
  let consoleErrors = [];

  // Kein storageState - verwende Mock Auth

  test.beforeEach(async ({ page }) => {
    // Reset error collections
    errors = [];
    networkErrors = [];
    consoleErrors = [];

    // Pipe console logs for debugging
    await pipePageConsole(page, 'plans-builder');

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
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for plan creation form
    const form = page.locator('#create-plan-form');
    await expect(form).toBeVisible();
    
    // Fill strength plan form
    await page.getByTestId('plan-name').fill('E2E Kraft – PPL');
    await page.getByTestId('plan-type').selectOption('strength');
    await page.getByTestId('plan-description').fill('E2E Test Plan für Push/Pull/Legs');
    
    // Submit form
    await page.getByTestId('plan-create').click();
    
    // Wait for form submission and plan creation
    await page.waitForTimeout(2000);
    
    // Check that plan appears in list
    await expect(page.locator('text=E2E Kraft – PPL')).toBeVisible();
    
    // Check stats updated
    await expect(page.locator('#total-plans')).toHaveText('2');
  });

  test('should create endurance plan', async ({ page }) => {
    await createMockPage(page);
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Look for plan creation form
    const form = page.locator('#create-plan-form');
    await expect(form).toBeVisible();
    
    // Fill endurance plan form
    await page.getByTestId('plan-name').fill('E2E Ausdauer – 10k');
    await page.getByTestId('plan-type').selectOption('endurance');
    await page.getByTestId('plan-description').fill('E2E Test Plan für 10k Aufbau');
    
    // Submit form
    await page.getByTestId('plan-create').click();
    
    // Wait for form submission and plan creation
    await page.waitForTimeout(2000);
    
    // Check that plan appears in list
    await expect(page.locator('text=E2E Ausdauer – 10k')).toBeVisible();
    
    // Check stats updated
    await expect(page.locator('#total-plans')).toHaveText('2');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Write error log if test failed
    if (testInfo.status === 'failed') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = join(process.cwd(), 'ops', 'LOGS', `e2e-plans-${timestamp}.md`);
      
      // Ensure logs directory exists
      const logsDir = join(process.cwd(), 'ops', 'LOGS');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }
      
      const logContent = `# E2E Plans Test Failed - ${timestamp}

## Test Results
- Test: ${testInfo.title}
- Status: ${testInfo.status}
- Duration: ${testInfo.duration}ms
- URL: ${page.url()}
- Title: ${await page.title()}

## Trace/Video Paths
- Trace: ${testInfo.outputDir}/trace.zip
- Video: ${testInfo.outputDir}/video.webm
- Screenshot: ${testInfo.outputDir}/screenshot.png

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
