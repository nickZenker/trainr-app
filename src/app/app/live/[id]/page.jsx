import { redirect } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabaseServer";

export default async function LiveSessionPage({ params }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  const { id } = params;

  // TODO: Fetch real live session data from API
  const mockSession = {
    id: id,
    name: "Krafttraining Oberkörper",
    type: "strength",
    startedAt: "2024-01-22T18:00:00Z",
    exercises: [
      {
        id: 1,
        name: "Bankdrücken",
        selectedVariant: "barbell",
        sets: [
          { index: 1, plannedReps: 12, plannedWeight: 60, actualReps: null, actualWeight: null, completed: false },
          { index: 2, plannedReps: 10, plannedWeight: 70, actualReps: null, actualWeight: null, completed: false },
          { index: 3, plannedReps: 8, plannedWeight: 80, actualReps: null, actualWeight: null, completed: false }
        ]
      },
      {
        id: 2,
        name: "Überzüge",
        selectedVariant: "dumbbell",
        sets: [
          { index: 1, plannedReps: 15, plannedWeight: 25, actualReps: null, actualWeight: null, completed: false },
          { index: 2, plannedReps: 12, plannedWeight: 30, actualReps: null, actualWeight: null, completed: false }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">{mockSession.name}</h1>
            <p className="text-text-muted">Live Training • {mockSession.type === 'strength' ? '💪 Kraft' : '🏃 Cardio'}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
              Pause
            </button>
            <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors">
              Beenden
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Timer */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8 text-center">
          <div className="text-4xl font-bold text-brand mb-2">00:15:32</div>
          <p className="text-text-muted">Trainingszeit</p>
        </div>

        {/* Current Exercise */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bankdrücken</h2>
            <div className="flex gap-2">
              <select className="bg-surface-hover text-foreground px-3 py-2 rounded-lg border border-border">
                <option value="barbell">Barbell</option>
                <option value="dumbbell">Dumbbell</option>
                <option value="machine">Machine</option>
              </select>
              <button className="bg-brand text-black px-3 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors">
                Übung hinzufügen
              </button>
            </div>
          </div>

          {/* Sets */}
          <div className="space-y-3">
            {mockSession.exercises[0].sets.map((set, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-surface-hover rounded-lg">
                <div className="text-sm font-medium w-8">S{set.index}</div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-text-muted block">Reps</label>
                    <input 
                      type="number" 
                      placeholder={set.plannedReps.toString()}
                      className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block">Gewicht (kg)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      placeholder={set.plannedWeight.toString()}
                      className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block">RPE</label>
                    <select className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand">
                      <option value="">Wähle RPE</option>
                      {[6,7,8,9,10].map(rpe => (
                        <option key={rpe} value={rpe}>{rpe}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors">
                  ✓
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-sm font-medium block mb-2">Notizen</label>
            <textarea 
              placeholder="Training-Notizen..."
              className="w-full bg-background text-foreground px-3 py-2 rounded border border-border focus:border-brand h-20"
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Übungen ({mockSession.exercises.length})</h3>
          <div className="space-y-2">
            {mockSession.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-brand' : 'bg-text-muted'}`}></div>
                  <span className="font-medium">{exercise.name}</span>
                  <span className="text-sm text-text-muted">({exercise.selectedVariant})</span>
                </div>
                <div className="text-sm text-text-muted">
                  {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} Sätze
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
