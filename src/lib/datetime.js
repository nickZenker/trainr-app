/**
 * Utility functions for datetime handling and conversion
 */

/**
 * Convert local datetime-local input value to UTC ISO string
 * @param {string} localValue - Local datetime string like "2025-10-14T18:00"
 * @returns {string|null} UTC ISO string or null if invalid
 */
export function localDatetimeToUtcIso(localValue) {
  if (!localValue) return null;
  
  const [datePart, timePart] = localValue.split('T');
  if (!datePart || !timePart) return null;
  
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  
  // Validate parsed values
  if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(hh) || isNaN(mm)) {
    return null;
  }
  
  // Construct as local time, then convert to UTC ISO
  const dt = new Date(y, (m - 1), d, hh, mm, 0, 0);
  const utcTime = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  
  return utcTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Convert ISO string to local time string for display
 * @param {string} iso - ISO datetime string
 * @returns {string} Local time string or empty string if invalid
 */
export function isoToLocalTimeString(iso) {
  if (!iso) return '';
  
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return '';
    
    return dt.toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error converting ISO to local time:', error);
    return '';
  }
}

/**
 * Convert ISO string to time-only string for display
 * @param {string} iso - ISO datetime string
 * @returns {string} Time string (HH:MM) or empty string if invalid
 */
export function isoToLocalTimeOnly(iso) {
  if (!iso) return '';
  
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return '';
    
    return dt.toLocaleTimeString('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error converting ISO to local time:', error);
    return '';
  }
}

