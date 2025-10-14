"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteSession } from "./actions";

export default function SessionActions({ session }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!confirm(`Möchtest du die Session "${session.name}" wirklich dauerhaft löschen?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("sessionId", session.id);
        
        const result = await deleteSession(formData);
        if (!result.success) {
          alert(`Fehler: ${result.message}`);
        }
      } catch (error) {
        alert(`Fehler: ${error.message}`);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Link 
        href={`/app/sessions/${session.id}`}
        className="flex-1 bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors text-center"
      >
        Bearbeiten
      </Link>
      <Link 
        href={`/app/live/${session.id}`}
        className="flex-1 bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-colors text-center"
      >
        Starten
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        title="Session löschen"
      >
        {isPending ? "..." : "🗑️"}
      </button>
    </div>
  );
}
