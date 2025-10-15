"use client";

import Link from "next/link";
import { useTransition } from "react";
import { duplicatePlanAction, softDeletePlanAction } from "./planActions";

export default function PlanActions({ plan, filter }) {
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = async (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("planId", plan.id);
        
        const result = await duplicatePlanAction(null, formData);
        if (!result.ok) {
          alert(`Fehler: ${result.error}`);
        }
      } catch (error) {
        alert(`Fehler: ${error.message}`);
      }
    });
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!confirm(`Möchtest du den Plan "${plan.name}" wirklich löschen?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("planId", plan.id);
        
        const result = await softDeletePlanAction(null, formData);
        if (!result.ok) {
          alert(`Fehler: ${result.error}`);
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
        href={`/app/plans/${plan.id}/edit`}
        className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
        data-testid={`plan-edit-${plan.id}`}
      >
        Bearbeiten
      </Link>
      
      <button 
        onClick={handleDuplicate}
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        data-testid={`plan-duplicate-${plan.id}`}
      >
        {isPending ? "..." : "Duplizieren"}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        data-testid={`plan-delete-${plan.id}`}
      >
        {isPending ? "..." : "Löschen"}
      </button>
    </div>
  );
}
