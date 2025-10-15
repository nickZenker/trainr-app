export async function pipePageConsole(page, label = 'E2E') {
  page.on('console', msg => {
    try { 
      console.log(`[${label}]`, msg.type(), msg.text()); 
    } catch (e) {
      // Ignore console errors during logging
    }
  });
  
  page.on('pageerror', err => {
    try {
      console.log(`[${label}] pageerror:`, err?.message);
    } catch (e) {
      // Ignore logging errors
    }
  });
  
  page.on('requestfailed', req => {
    try {
      console.log(`[${label}] requestfailed:`, req.url(), req.failure()?.errorText);
    } catch (e) {
      // Ignore logging errors
    }
  });
}
