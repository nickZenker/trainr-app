"use client";

import Link from "next/link";

export default function FilterToggle({ currentFilter }) {
  return (
    <div className="flex gap-2 mb-6">
      <Link
        href="/app/plans?filter=active"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentFilter === "active"
            ? "bg-brand text-black"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        Aktiv
      </Link>
      <Link
        href="/app/plans?filter=archived"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentFilter === "archived"
            ? "bg-brand text-black"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        Archiv
      </Link>
      <Link
        href="/app/plans"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentFilter === "all"
            ? "bg-brand text-black"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        Alle
      </Link>
    </div>
  );
}
