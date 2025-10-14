/**
 * Global error instrumentation for Next.js 15
 * Handles unhandledRejection and uncaughtException in development
 */

export async function register() {
  // Only register in Node.js runtime, not Edge Runtime
  if (process.env.NODE_ENV === 'development' && typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logErrorToFile('unhandledRejection', {
        reason: reason?.toString() || 'Unknown reason',
        promise: promise?.toString() || 'Unknown promise',
        stack: reason?.stack || 'No stack trace'
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logErrorToFile('uncaughtException', {
        name: error.name,
        message: error.message,
        stack: error.stack || 'No stack trace'
      });
      
      // Log to console as well
      console.error('🚨 Uncaught Exception:', error);
    });
  }
}

/**
 * Log error to file in development
 */
function logErrorToFile(type: string, errorData: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const logFile = path.join(process.cwd(), 'ops', 'LOGS', `dev-errors-${today}.md`);
    const logsDir = path.dirname(logFile);
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      NODE_ENV: !!process.env.NODE_ENV
    };
    
    const logEntry = `## ${type} - ${timestamp}

**Error Details:**
- Type: ${type}
- Message: ${errorData.message || errorData.reason || 'No message'}
- Stack: \`\`\`
${errorData.stack || 'No stack trace'}
\`\`\`

**Environment Status:**
- NEXT_PUBLIC_SUPABASE_URL: ${envStatus.NEXT_PUBLIC_SUPABASE_URL}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY}
- SUPABASE_SERVICE_KEY: ${envStatus.SUPABASE_SERVICE_KEY}
- NODE_ENV: ${envStatus.NODE_ENV}

---

`;
    
    // Append to log file
    fs.appendFileSync(logFile, logEntry);
    console.log(`📝 Error logged to: ${logFile}`);
    
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }
}
