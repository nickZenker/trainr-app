'use client';

import React, { useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updatePlanAction } from '../../planActions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
      data-testid="plan-update-submit"
    >
      {pending ? 'Aktualisiere...' : 'Plan aktualisieren'}
    </button>
  );
}

export default function EditPlanForm({ plan }) {
  const router = useRouter();
  const [state, formAction] = React.useActionState(updatePlanAction, null);

  useEffect(() => {
    if (state?.ok) {
      // Redirect back to plans list on success
      router.push('/app/plans');
    }
  }, [state, router]);

  return (
    <div className="bg-surface rounded-lg p-6 border border-border">
      <h2 className="text-xl font-semibold mb-4">Plan bearbeiten</h2>
      
      {state?.ok === false && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm" data-testid="plan-error">
          {state.error}
        </div>
      )}
      
      {state?.ok && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          {state.message}
        </div>
      )}
      
      <form action={formAction} className="space-y-4" data-testid="plan-edit-form">
        <input type="hidden" name="planId" value={plan.id} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={plan.name}
              required
              minLength={1}
              maxLength={120}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="z.B. Kraft – Push/Pull/Legs"
              data-testid="plan-name"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
              Typ *
            </label>
            <select
              id="type"
              name="type"
              defaultValue={plan.type || "strength"}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              data-testid="plan-type"
            >
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-foreground mb-2">
            Ziel *
          </label>
          <textarea
            id="goal"
            name="goal"
            defaultValue={plan.goal || ''}
            rows={2}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="z.B. 3-Tage Split für Kraftaufbau"
            data-testid="plan-goal"
          />
        </div>
        
        <div>
          <label htmlFor="weeks" className="block text-sm font-medium text-foreground mb-2">
            Wochen *
          </label>
          <input
            type="number"
            id="weeks"
            name="weeks"
            defaultValue={plan.weeks || 8}
            min="1"
            max="52"
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            data-testid="plan-weeks"
          />
        </div>
        
        <div className="flex gap-3">
          <SubmitButton />
          <button
            type="button"
            onClick={() => router.push('/app/plans')}
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-surface transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
