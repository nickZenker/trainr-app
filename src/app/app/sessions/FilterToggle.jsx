"use client";

import Link from "next/link";

export default function FilterToggle({ currentFilter }) {
  return (
    <div className="flex gap-2 mb-6">
      <Link
        href="/app/sessions"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentFilter === "all"
            ? "bg-brand text-black"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        Alle
      </Link>
      <Link
        href="/app/sessions?type=strength"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentFilter === "strength"
            ? "bg-brand text-black"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        Kraft
      </Link>
      <Link
        href="/app/sessions?type=cardio"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentFilter === "cardio"
            ? "bg-brand text-black"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        Cardio
      </Link>
    </div>
  );
}
