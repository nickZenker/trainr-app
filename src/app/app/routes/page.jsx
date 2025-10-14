import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import Link from "next/link";
import Map from "../../../components/Map";

export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  // TODO: Fetch real routes from API
  const mockRoutes = [
    {
      id: 1,
      name: "Stadtpark Runde",
      surface: "asphalt",
      distance_m: 5000,
      climb_m: 50,
      route: [
        [50.1109, 8.6821], // Frankfurt
        [50.1150, 8.6850],
        [50.1180, 8.6880],
        [50.1150, 8.6900],
        [50.1109, 8.6821]
      ],
      created_at: "2024-01-01"
    },
    {
      id: 2,
      name: "Rhein Mainufer",
      surface: "gravel",
      distance_m: 8000,
      climb_m: 20,
      route: [
        [50.1109, 8.6821],
        [50.1080, 8.6750],
        [50.1050, 8.6700],
        [50.1080, 8.6800],
        [50.1109, 8.6821]
      ],
      created_at: "2024-01-15"
    }
  ];

  const surfaceColors = {
    asphalt: "bg-gray-500",
    gravel: "bg-yellow-600", 
    trail: "bg-green-600",
    track: "bg-red-600"
  };

  const surfaceLabels = {
    asphalt: "Asphalt",
    gravel: "Schotter",
    trail: "Trail",
    track: "Bahn"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">Routen</h1>
            <p className="text-text-muted">GPS-Routen und Strecken</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/app/routes/new"
              className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors"
            >
              GPX Import
            </Link>
            <Link 
              href="/app/routes/new"
              className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Neue Route
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium">
            Alle
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Laufen
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Radfahren
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Wandern
          </button>
        </div>

        {/* Routes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockRoutes.map((route) => (
            <div key={route.id} className="bg-surface rounded-lg border border-border overflow-hidden">
              {/* Map */}
              <div className="h-48">
                <Map 
                  center={route.route[0]}
                  zoom={14}
                  route={route.route}
                  height="100%"
                  className="rounded-t-lg"
                />
              </div>
              
              {/* Route Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{route.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${surfaceColors[route.surface]}`}></div>
                      <span className="text-sm text-text-muted">{surfaceLabels[route.surface]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{(route.distance_m / 1000).toFixed(1)} km</div>
                    <div className="text-sm text-text-muted">+{route.climb_m}m</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-brand">{(route.distance_m / 1000).toFixed(1)}</div>
                    <div className="text-xs text-text-muted">km</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-brand">+{route.climb_m}</div>
                    <div className="text-xs text-text-muted">Höhenmeter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-brand">{surfaceLabels[route.surface]}</div>
                    <div className="text-xs text-text-muted">Oberfläche</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link 
                    href={`/app/routes/${route.id}`}
                    className="flex-1 bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors text-center"
                  >
                    Details
                  </Link>
                  <button className="flex-1 bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-colors">
                    Starten
                  </button>
                  <button className="bg-surface-hover text-foreground px-3 py-2 rounded-lg font-medium hover:bg-border transition-colors">
                    ⋯
                  </button>
                </div>

                <div className="text-xs text-text-muted mt-3">
                  Erstellt: {new Date(route.created_at).toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockRoutes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-text-muted text-lg mb-4">Keine Routen gefunden</p>
            <Link 
              href="/app/routes/new"
              className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Erste Route erstellen
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

