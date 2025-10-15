/**
 * Calendar utility functions for date calculations and grid generation
 */

/**
 * Get start of week (Monday) for a given date
 */
export function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

/**
 * Get end of week (Sunday) for a given date
 */
export function endOfWeek(d) {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Get start of month for a given date
 */
export function startOfMonth(d) {
  const date = new Date(d);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month for a given date
 */
export function endOfMonth(d) {
  const date = new Date(d);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Generate array of dates between start and end (inclusive)
 */
export function eachDayRange(start, end) {
  const dates = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Generate weeks array for month grid view (Monday-Sunday)
 * Returns array of week arrays, each containing 7 dates
 */
export function weeksInMonthGrid(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Start from Monday of the week containing month start
  const gridStart = startOfWeek(monthStart);
  
  // End on Sunday of the week containing month end
  const gridEnd = endOfWeek(monthEnd);
  
  const weeks = [];
  const current = new Date(gridStart);
  
  while (current <= gridEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  
  return weeks;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if a date is today
 */
export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(date, currentMonth) {
  return date.getFullYear() === currentMonth.getFullYear() &&
         date.getMonth() === currentMonth.getMonth();
}

/**
 * Format date for display (e.g., "Jan 2024" or "KW 3")
 */
export function formatMonthYear(date) {
  return date.toLocaleDateString('de-DE', { 
    month: 'long', 
    year: 'numeric' 
  });
}

/**
 * Get week number for a date
 */
export function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Format week range for display (e.g., "KW 3 (15.01 - 21.01.2024)")
 */
export function formatWeekRange(date) {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const weekNumber = getWeekNumber(date);
  
  const startStr = weekStart.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const endStr = weekEnd.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  return `KW ${weekNumber} (${startStr} - ${endStr})`;
}
