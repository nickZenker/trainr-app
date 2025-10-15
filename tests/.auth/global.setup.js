import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('🚀 Starting global setup for persistent auth...');
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const email = process.env.E2E_EMAIL || 'e2e.user+local@test.dev';
  const password = process.env.E2E_PASS || 'TestUser!23456';
  
  console.log(`📧 Using email: ${email}`);
  console.log(`🌐 Base URL: ${baseURL}`);
  
  // Create auth directory if it doesn't exist
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  // Launch browser for auth setup
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Try login first (more reliable for E2E)
    console.log('🔐 Attempting login...');
    await page.goto(`${baseURL}/auth/login`);
    
    // Wait for form to load
    await page.waitForSelector('[data-testid="auth-email"]', { timeout: 10000 });
    
    // Fill login form
    await page.fill('[data-testid="auth-email"]', email);
    await page.fill('[data-testid="auth-password"]', password);
    await page.click('[data-testid="auth-submit"]');
    
    // Wait for redirect or error
    try {
      await page.waitForURL('**/app**', { timeout: 10000 });
      console.log('✅ Login successful, redirected to /app');
    } catch {
      console.log('⚠️ Login failed, trying signup...');
      
      // Try signup as fallback
      await page.goto(`${baseURL}/auth/signup`);
      await page.waitForSelector('[data-testid="signup-email"]', { timeout: 10000 });
      
      await page.fill('[data-testid="signup-email"]', email);
      await page.fill('[data-testid="signup-password"]', password);
      await page.click('[data-testid="signup-submit"]');
      
      // Wait for redirect to /app
      await page.waitForURL('**/app**', { timeout: 10000 });
      console.log('✅ Signup successful, redirected to /app');
    }
    
    // Verify we're logged in by checking for app content
    await page.waitForSelector('h1', { timeout: 5000 });
    const pageTitle = await page.textContent('h1');
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Save storage state
    const statePath = path.join(authDir, 'state.json');
    await context.storageState({ path: statePath });
    console.log(`💾 Auth state saved to: ${statePath}`);
    
    console.log('✅ Global setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
