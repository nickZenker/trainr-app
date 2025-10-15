"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`
        }
      });
      
      if (error) {
        // Friendly error messages
        if (error.message.includes('400') || error.message.includes('Invalid')) {
          setError('Bitte Redirect-URL in Supabase Dashboard prüfen. Siehe docs/AUTH_FIX.md');
        } else if (error.message.includes('already registered')) {
          setError('Diese E-Mail ist bereits registriert. Bitte loggen Sie sich ein.');
        } else {
          setError(error.message);
        }
        return;
      }
      
      // Success - redirect to app
      router.replace("/app");
    } catch (err) {
      setError('Unerwarteter Fehler beim Registrieren. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Registrieren</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <label className="block text-sm">
          <span className="sr-only">Email</span>
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="signup-email"
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
            data-testid="signup-password"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
          data-testid="signup-submit"
        >
          {loading ? "Bitte warten..." : "Registrieren"}
        </button>
        <div className="text-sm">
          <a href="/auth/login" className="underline">Bereits angemeldet? Login</a>
        </div>
      </form>
    </div>
  );
}


