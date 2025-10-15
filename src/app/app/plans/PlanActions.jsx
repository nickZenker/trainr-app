"use client";

import Link from "next/link";
import { useTransition } from "react";
import { togglePlanArchive, deletePlan as deletePlanAction } from "./actions";

export default function PlanActions({ plan, filter }) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = async (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("planId", plan.id);
        formData.append("archive", plan.active ? "true" : "false");
        
        const result = await togglePlanArchive(formData);
        if (!result.success) {
          alert(`Fehler: ${result.message}`);
        }
      } catch (error) {
        alert(`Fehler: ${error.message}`);
      }
    });
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!confirm(`Möchtest du den Plan "${plan.name}" wirklich dauerhaft löschen?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("planId", plan.id);
        
        const result = await deletePlanAction(formData);
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
        href={`/app/plans/${plan.id}/schedule`}
        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        data-testid={`plan-schedule-link-${plan.id}`}
      >
        Einplanen
      </Link>
      
      <Link 
        href={`/app/plans/${plan.id}`}
        className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
      >
        Bearbeiten
      </Link>
      
      <button 
        onClick={handleArchive}
        disabled={isPending}
        className="bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : (plan.active ? "Archivieren" : "Wiederherstellen")}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Löschen"}
      </button>
    </div>
  );
}
