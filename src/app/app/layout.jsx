import { supabaseServer } from "../../lib/supabaseServer";
import { redirect } from "next/navigation";
import AppShell from "../../components/layout/AppShell";

// Force all app routes to be dynamic since they use authentication
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
  // Check authentication
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  return <AppShell>{children}</AppShell>;
}