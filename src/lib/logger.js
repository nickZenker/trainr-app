/**
 * Centralized logging utility
 * Development: Console + Logfile, Production: Console only
 */

/**
 * Log error with metadata
 * @param {Error|string} error - Error object or error message
 * @param {Object} meta - Additional metadata
 */
export function logError(error, meta = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    message: typeof error === 'string' ? error : error?.message || 'Unknown error',
    stack: error?.stack || null,
    meta: meta || {}
  };

  // Always log to console
  console.error('🚨 ERROR:', errorData);

  // In development, also log to file
  if (process.env.NODE_ENV === 'development') {
    logToFile(errorData);
  }
}

/**
 * Log warning with metadata
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
export function logWarn(message, meta = {}) {
  const warnData = {
    timestamp: new Date().toISOString(),
    type: 'WARN',
    message,
    meta: meta || {}
  };

  // Always log to console
  console.warn('⚠️ WARN:', warnData);

  // In development, also log to file
  if (process.env.NODE_ENV === 'development') {
    logToFile(warnData);
  }
}

/**
 * Log info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
export function logInfo(message, meta = {}) {
  const infoData = {
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message,
    meta: meta || {}
  };

  // Always log to console
  console.info('ℹ️ INFO:', infoData);

  // In development, also log to file
  if (process.env.NODE_ENV === 'development') {
    logToFile(infoData);
  }
}

/**
 * Log to file in development
 * @param {Object} logData - Log data object
 */
function logToFile(logData) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const logFile = path.join(process.cwd(), 'ops', 'LOGS', `dev-logs-${today}.md`);
    const logsDir = path.dirname(logFile);
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logEntry = `## ${logData.type} - ${logData.timestamp}

**Message:** ${logData.message}

${logData.stack ? `**Stack:**\n\`\`\`\n${logData.stack}\n\`\`\`\n` : ''}

${Object.keys(logData.meta).length > 0 ? `**Metadata:**\n\`\`\`json\n${JSON.stringify(logData.meta, null, 2)}\n\`\`\`\n` : ''}

---

`;
    
    // Append to log file
    fs.appendFileSync(logFile, logEntry);
    
  } catch (logError) {
    console.error('Failed to write log file:', logError);
  }
}

/**
 * Get recent log entries from today's log file
 * @param {number} limit - Number of entries to return
 * @returns {Array} Array of log entries
 */
export function getRecentLogs(limit = 10) {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const logFile = path.join(process.cwd(), 'ops', 'LOGS', `dev-logs-${today}.md`);
    
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const entries = content.split('---').filter(entry => entry.trim()).slice(-limit);
    
    return entries.map(entry => {
      const lines = entry.trim().split('\n');
      const header = lines[0];
      const message = lines.find(line => line.startsWith('**Message:**'))?.replace('**Message:**', '').trim() || '';
      
      return {
        header: header.replace(/^## /, ''),
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      };
    });
    
  } catch (error) {
    console.error('Failed to read log file:', error);
    return [];
  }
}
