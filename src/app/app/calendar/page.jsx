import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "../../../lib/supabaseServer";
import { listScheduledSessions } from "../../../services/sessions";
import { isoToLocalTimeOnly } from "../../../lib/datetime";
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  weeksInMonthGrid,
  isToday,
  isCurrentMonth,
  formatMonthYear,
  formatWeekRange
} from "../../../lib/calendar";

// Helper function to get date range for month view
function getMonthRange(date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

// Helper function to get date range for week view
function getWeekRange(date) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

// Helper function to format time for display
function formatTime(isoString) {
  return isoToLocalTimeOnly(isoString);
}

// Calendar grid component for month view
function MonthGrid({ sessions, currentDate }) {
  const weeks = weeksInMonthGrid(currentDate);
  
  // Group sessions by date
  const sessionsByDate = {};
  sessions.forEach(session => {
    const date = new Date(session.scheduled_at);
    const dateKey = date.toISOString().split('T')[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Weekday headers */}
      {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-text-muted bg-surface border border-border">
          {day}
        </div>
      ))}
      
      {/* Calendar weeks */}
      {weeks.map((week, weekIndex) => 
        week.map((date, dayIndex) => {
          const dateKey = date.toISOString().split('T')[0];
          const daySessions = sessionsByDate[dateKey] || [];
          const isCurrentDay = isToday(date);
          const isCurrentMonthDay = isCurrentMonth(date, currentDate);
          
          return (
            <div 
              key={`${weekIndex}-${dayIndex}`}
              className={`p-2 h-24 bg-background border border-border ${
                isCurrentDay ? 'bg-brand/10 border-brand ring-2 ring-brand/20' : ''
              } ${!isCurrentMonthDay ? 'opacity-40' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentDay ? 'text-brand font-bold' : 
                isCurrentMonthDay ? 'text-foreground' : 'text-text-muted'
              }`}>
                {date.getDate()}
                {isCurrentDay && <span className="ml-1 text-xs">●</span>}
              </div>
              <div className="space-y-1">
                {daySessions.length > 0 ? (
                  daySessions.slice(0, 3).map(session => (
                    <div 
                      key={session.id}
                      className={`text-xs p-1 rounded truncate ${
                        session.plan_type === 'strength' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                      title={`${session.name} - ${formatTime(session.scheduled_at)}${session.duration_min ? ` (${session.duration_min}min)` : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatTime(session.scheduled_at)}</span>
                        <span className="truncate">{session.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-text-muted opacity-50">—</div>
                )}
                {daySessions.length > 3 && (
                  <div className="text-xs text-text-muted">
                    +{daySessions.length - 3} weitere
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Calendar grid component for week view
function WeekGrid({ sessions, currentDate }) {
  const range = getWeekRange(currentDate);
  const startDate = new Date(range.start);
  
  // Create array of 7 days
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  
  // Group sessions by date
  const sessionsByDate = {};
  sessions.forEach(session => {
    const date = new Date(session.scheduled_at);
    const dateKey = date.toISOString().split('T')[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Weekday headers */}
      {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-text-muted bg-surface border border-border">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {days.map((date, index) => {
        const dateKey = date.toISOString().split('T')[0];
        const daySessions = sessionsByDate[dateKey] || [];
        const isCurrentDay = isToday(date);
        
        return (
          <div 
            key={index} 
            className={`p-2 min-h-32 bg-background border border-border ${
              isCurrentDay ? 'bg-brand/10 border-brand ring-2 ring-brand/20' : ''
            }`}
          >
            <div className={`text-sm font-medium mb-2 ${
              isCurrentDay ? 'text-brand font-bold' : 'text-foreground'
            }`}>
              {date.getDate()}
              {isCurrentDay && <span className="ml-1 text-xs">●</span>}
            </div>
            <div className="space-y-1">
              {daySessions.length > 0 ? (
                daySessions.map(session => (
                  <div 
                    key={session.id}
                    className={`text-xs p-2 rounded ${
                      session.plan_type === 'strength' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    <div className="font-medium">{formatTime(session.scheduled_at)}</div>
                    <div className="truncate">{session.name}</div>
                    {session.plan_type && (
                      <div className="mt-1">
                        <span className={`inline-block rounded px-1 py-0.5 text-xs border ${
                          session.plan_type === 'strength' 
                            ? 'bg-blue-200 text-blue-900 border-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600'
                            : 'bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600'
                        }`}>
                          {session.plan_type === 'strength' ? 'Strength' : 'Endurance'}
                        </span>
                      </div>
                    )}
                    {session.duration_min && (
                      <div className="text-xs opacity-75 mt-1">({session.duration_min}min)</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-muted opacity-50">—</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main calendar page component
export default async function CalendarPage({ searchParams }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth/login");
  }

  // Parse query parameters
  const view = searchParams?.view || 'month';
  const dateParam = searchParams?.d;
  
  let currentDate;
  if (dateParam) {
    currentDate = new Date(dateParam);
    if (isNaN(currentDate.getTime())) {
      currentDate = new Date();
    }
  } else {
    currentDate = new Date();
  }

  // Get date range based on view
  const range = view === 'week' ? getWeekRange(currentDate) : getMonthRange(currentDate);
  
  // Fetch scheduled sessions
  let sessions = [];
  try {
    sessions = await listScheduledSessions(range.start, range.end);
  } catch (error) {
    console.error('Error fetching scheduled sessions:', error);
  }

  // Navigation URLs
  const prevDate = new Date(currentDate);
  const nextDate = new Date(currentDate);
  
  if (view === 'month') {
    prevDate.setMonth(currentDate.getMonth() - 1);
    nextDate.setMonth(currentDate.getMonth() + 1);
  } else {
    prevDate.setDate(currentDate.getDate() - 7);
    nextDate.setDate(currentDate.getDate() + 7);
  }
  
  const today = new Date();
  const todayParam = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">Kalender</h1>
            <p className="text-text-muted">
              {view === 'month' ? formatMonthYear(currentDate) : formatWeekRange(currentDate)}
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/app/calendar?view=${view}&d=${prevDate.toISOString().split('T')[0]}`}
              className="bg-surface hover:bg-surface-hover text-foreground px-3 py-2 rounded border border-border transition-colors"
            >
              ← Prev
            </Link>
            <Link
              href={`/app/calendar?view=${view}&d=${todayParam}`}
              className="bg-brand hover:bg-brand-hover text-black px-3 py-2 rounded font-medium transition-colors"
            >
              Heute
            </Link>
            <Link
              href={`/app/calendar?view=${view}&d=${nextDate.toISOString().split('T')[0]}`}
              className="bg-surface hover:bg-surface-hover text-foreground px-3 py-2 rounded border border-border transition-colors"
            >
              Next →
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href={`/app/calendar?view=month&d=${currentDate.toISOString().split('T')[0]}`}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                view === 'month' 
                  ? 'bg-brand text-black' 
                  : 'bg-surface text-foreground hover:bg-surface-hover border border-border'
              }`}
            >
              Month
            </Link>
            <Link
              href={`/app/calendar?view=week&d=${currentDate.toISOString().split('T')[0]}`}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                view === 'week' 
                  ? 'bg-brand text-black' 
                  : 'bg-surface text-foreground hover:bg-surface-hover border border-border'
              }`}
            >
              Week
            </Link>
          </div>
        </div>

        {/* Calendar Grid */}
        {sessions.length > 0 ? (
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            {view === 'month' ? (
              <MonthGrid sessions={sessions} currentDate={currentDate} />
            ) : (
              <WeekGrid sessions={sessions} currentDate={currentDate} />
            )}
          </div>
        ) : (
          <div className="bg-surface rounded-lg border border-border p-8 text-center">
            <div className="text-text-muted mb-4">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="text-lg font-medium mb-2">Keine geplanten Sessions</h3>
              <p className="text-sm">In diesem Zeitraum sind keine Sessions geplant.</p>
            </div>
            <Link 
              href="/app/sessions" 
              className="inline-block bg-brand hover:bg-brand-hover text-black px-4 py-2 rounded font-medium transition-colors"
            >
              Sessions planen
            </Link>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded"></div>
            <span className="text-text-muted">Strength Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded"></div>
            <span className="text-text-muted">Endurance Training</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-surface border border-border rounded text-sm text-text-muted">
          <p>💡 <strong>Tipp:</strong> Plane deine Sessions über die <Link href="/app/sessions" className="text-brand hover:underline">Sessions-Seite</Link>.</p>
        </div>
      </main>
    </div>
  );
}
