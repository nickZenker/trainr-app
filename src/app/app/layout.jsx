import { supabaseServer } from "../../lib/supabaseServer";
import { redirect } from "next/navigation";
import TopNavTabs from "../../components/TopNavTabs";

// Force all app routes to be dynamic since they use authentication
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
  // Check authentication
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* App Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">
                Trainr App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-muted">
                Hallo, {data.user.email}
              </span>
              <form action="/auth/logout" method="post">
                <button 
                  type="submit"
                  className="text-sm text-text-muted hover:text-foreground transition-colors"
                >
                  Abmelden
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Top Navigation Tabs */}
      <TopNavTabs />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}