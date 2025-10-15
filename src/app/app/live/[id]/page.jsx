import { redirect } from "next/navigation";
import { getLiveSession, getLiveStats, getRecentSets, getSessionExercisesForLive } from "../../../../services/liveSessions";
import { startLive, stopLive, pauseLive, resumeLive, logSetAction, undoLastSet } from "./actions";

export default async function LiveSessionPage({ params }) {
  const { id } = await params;

  try {
    // Load real live session data from service layer
    const session = await getLiveSession(id);
    const stats = await getLiveStats(id);
    const recentSets = await getRecentSets(id, 10);
    const sessionExercises = await getSessionExercisesForLive(id);
    
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border px-6 py-4">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-brand">Live Training</h1>
              <p className="text-text-muted">Live Training • {session.type === 'strength' ? '💪 Kraft' : '🏃 Cardio'}</p>
            </div>
                   <div className="flex gap-2">
                     {stats.status === 'active' ? (
                       <>
                         <form action={pauseLive}>
                           <input type="hidden" name="liveId" value={session.id} />
                           <button 
                             type="submit"
                             className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                           >
                             Pause
                           </button>
                         </form>
                         <form action={stopLive}>
                           <input type="hidden" name="liveId" value={session.id} />
                           <button 
                             type="submit"
                             className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                             data-testid="live-stop"
                           >
                             Stop
                           </button>
                         </form>
                       </>
                     ) : stats.status === 'paused' ? (
                       <>
                         <form action={resumeLive}>
                           <input type="hidden" name="liveId" value={session.id} />
                           <button 
                             type="submit"
                             className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                           >
                             Resume
                           </button>
                         </form>
                         <form action={stopLive}>
                           <input type="hidden" name="liveId" value={session.id} />
                           <button 
                             type="submit"
                             className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                             data-testid="live-stop"
                           >
                             Stop
                           </button>
                         </form>
                       </>
                     ) : (
                       <form action={startLive}>
                         <input type="hidden" name="sessionId" value={id} />
                         <button 
                           type="submit"
                           className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
                           data-testid="live-start"
                         >
                           Start
                         </button>
                       </form>
                     )}
                   </div>
          </div>
        </header>

        <main className="p-6 max-w-4xl mx-auto">
          {/* Session Info */}
          <div className="bg-surface rounded-lg p-6 border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Status:</span>
                <span className="ml-2 font-medium">{stats.status}</span>
              </div>
              <div>
                <span className="text-text-muted">Gestartet:</span>
                <span className="ml-2 font-medium">{new Date(stats.startedAt).toLocaleString()}</span>
              </div>
              {stats.finishedAt && (
                <div>
                  <span className="text-text-muted">Beendet:</span>
                  <span className="ml-2 font-medium">{new Date(stats.finishedAt).toLocaleString()}</span>
                </div>
              )}
              <div>
                <span className="text-text-muted">Sätze geloggt:</span>
                <span className="ml-2 font-medium">{stats.setCount}</span>
              </div>
            </div>
          </div>

          {/* Session Exercises */}
          {session.meta?.exercises && session.meta.exercises.length > 0 && (
            <div className="bg-surface rounded-lg p-6 border border-border mb-6">
              <h3 className="text-lg font-semibold mb-4">Geplante Übungen</h3>
              <div className="flex flex-wrap gap-2" data-testid="live-exercises-list">
                {session.meta.exercises.map((exercise, index) => (
                  <span 
                    key={exercise.id || index}
                    className="bg-brand/20 text-brand px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {exercise.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Set Logging Form */}
          <div className="bg-surface rounded-lg p-6 border border-border mb-6">
            <h3 className="text-lg font-semibold mb-4">Set Logging</h3>
            <form action={logSetAction} className="grid grid-cols-2 gap-4">
              <input type="hidden" name="liveId" value={id} />
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Exercise</label>
                <select 
                  name="sessionExerciseId"
                  className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                >
                  <option value="">— Exercise wählen —</option>
                  {sessionExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.exercises?.name || `Exercise #${exercise.id}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Set Index</label>
                <input 
                  name="setIndex" 
                  type="number" 
                  min="0" 
                  defaultValue="1"
                  className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reps *</label>
                <input 
                  name="reps" 
                  type="number" 
                  min="0" 
                  required
                  className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input 
                  name="weight" 
                  type="number" 
                  step="0.5" 
                  min="0"
                  className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">RPE (1-10)</label>
                <input 
                  name="rpe" 
                  type="number" 
                  min="1" 
                  max="10"
                  className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input 
                  name="notes" 
                  type="text"
                  placeholder="Optional notes..."
                  className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                />
              </div>
              
              <div className="col-span-2">
                <button 
                  type="submit"
                  className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
                  data-testid="live-logset"
                >
                  Log Set
                </button>
              </div>
            </form>
            
            {sessionExercises.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  Keine Exercises in dieser Session – Set wird ohne Exercise-ID geloggt.
                </p>
              </div>
            )}
          </div>

          {/* Recent Sets */}
          <div className="bg-surface rounded-lg p-6 border border-border mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Letzte geloggte Sets ({recentSets.length})</h3>
              {recentSets.length > 0 && (
                <form action={undoLastSet}>
                  <input type="hidden" name="liveId" value={id} />
                  <button 
                    type="submit"
                    className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30 transition-colors"
                    data-testid="live-undo"
                  >
                    Undo last set
                  </button>
                </form>
              )}
            </div>
            {recentSets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">#</th>
                      <th className="text-left py-2">Set</th>
                      <th className="text-left py-2">Reps</th>
                      <th className="text-left py-2">Weight</th>
                      <th className="text-left py-2">RPE</th>
                      <th className="text-left py-2">Notes</th>
                      <th className="text-left py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSets.map((set, index) => (
                      <tr key={set.id} className="border-b border-border/50">
                        <td className="py-2 text-text-muted">{index + 1}</td>
                        <td className="py-2 font-medium">{set.set_index}</td>
                        <td className="py-2">{set.actual_reps || '-'}</td>
                        <td className="py-2">{set.actual_weight ? `${set.actual_weight}kg` : '-'}</td>
                        <td className="py-2">{set.rpe || '-'}</td>
                        <td className="py-2 text-text-muted max-w-32 truncate">{set.notes || '-'}</td>
                        <td className="py-2 text-text-muted text-xs">
                          {new Date(set.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <p className="text-text-muted">Noch keine Sets geloggt.</p>
                <p className="text-text-muted text-sm mt-2">Kein Set zum Rückgängig machen.</p>
              </div>
            )}
          </div>

          {/* Placeholder for future exercise UI */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Übungen</h3>
            <p className="text-text-muted">Exercise UI wird in zukünftigen Iterationen implementiert.</p>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Live session error:', error);
    
    // If live session doesn't exist, show a page to create one
    if (error.message.includes('live_sessions:get failed')) {
      return (
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border px-6 py-4">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-brand">Live Training</h1>
                <p className="text-text-muted">Neue Live-Session starten</p>
              </div>
            </div>
          </header>

          <main className="p-6 max-w-4xl mx-auto">
            <div className="bg-surface rounded-lg p-6 border border-border mb-6">
              <h2 className="text-xl font-semibold mb-4">Live-Session nicht gefunden</h2>
              <p className="text-text-muted mb-4">
                Die Live-Session mit ID "{id}" existiert noch nicht. Du kannst eine neue Live-Session starten.
              </p>
              
              <form action={startLive}>
                <input type="hidden" name="sessionId" value={id} />
                <button 
                  type="submit"
                  className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
                >
                  Neue Live-Session starten
                </button>
              </form>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Debug:</strong> Session ID: {id}
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Hinweis</h3>
              <p className="text-blue-300 text-sm">
                Live-Sessions werden automatisch erstellt, wenn du den "Start" Button klickst. 
                Du kannst auch direkt zu einer bestehenden Session navigieren, falls du eine kennst.
              </p>
            </div>
          </main>
        </div>
      );
    }

    // For other errors, show the error page
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-400 mb-2">Fehler beim Laden der Live-Session</h1>
            <p className="text-red-300">Session ID: {id}</p>
            <p className="text-red-300">Fehler: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
}

