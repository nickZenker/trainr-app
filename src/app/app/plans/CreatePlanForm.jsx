'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createPlanAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
      data-testid="plan-create"
    >
      {pending ? 'Erstelle...' : 'Plan erstellen'}
    </button>
  );
}

export default function CreatePlanForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(createPlanAction, null);

  useEffect(() => {
    console.log('CreatePlanForm state changed:', state);
    if (state?.ok && state?.planId) {
      // Redirect to schedule page on success
      console.log('Redirecting to schedule page:', `/app/plans/${state.planId}/schedule`);
      router.push(`/app/plans/${state.planId}/schedule`);
    } else if (state?.ok === false) {
      console.error('Plan creation failed:', state.error);
    }
  }, [state, router]);

  return (
    <div className="bg-surface rounded-lg p-6 border border-border mb-6">
      <h2 className="text-xl font-semibold mb-4">Neuen Plan erstellen</h2>
      
      {state?.error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {state.error}
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
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
              defaultValue="strength"
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
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="z.B. 3-Tage Split für Kraftaufbau"
            data-testid="plan-description"
          />
        </div>
        
        <SubmitButton />
      </form>
    </div>
  );
}

