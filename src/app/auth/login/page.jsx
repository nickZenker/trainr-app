"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Ungültige Anmeldedaten. Bitte prüfen Sie E-Mail und Passwort.');
        } else if (error.message.includes('400')) {
          setError('Authentifizierungsfehler. Bitte Supabase-Konfiguration prüfen.');
        } else {
          setError(error.message);
        }
        return;
      }
      
      // Success - redirect to app
      router.replace("/app");
    } catch (err) {
      setError('Unerwarteter Fehler beim Anmelden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <label className="block text-sm">
          <span className="sr-only">Email</span>
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="auth-email"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="sr-only">Passwort</span>
          <input
            type="password"
            placeholder="Passwort"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="auth-password"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
          data-testid="auth-submit"
        >
          {loading ? "Bitte warten..." : "Einloggen"}
        </button>
        <div className="text-sm">
          <a href="/auth/signup" className="underline" data-testid="link-signup">Noch kein Konto? Registrieren</a>
        </div>
        <div className="text-sm">
          <a href="/auth/reset-password" className="underline">Passwort vergessen?</a>
        </div>
      </form>
    </div>
  );
}


