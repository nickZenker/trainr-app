'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { createPlanAction } from './actions'

const initial = { ok: null, error: null, planId: null }

export default function CreatePlanForm() {
  const router = useRouter()
  const [state, formAction, isPending] = React.useActionState(createPlanAction, initial)

  React.useEffect(() => {
    if (state?.ok && state?.planId) {
      router.push(`/app/plans/${state.planId}/schedule`)
    }
  }, [state, router])

  return (
    <form action={formAction} data-testid="plan-create-form" className="grid gap-4 max-w-lg">
      <input name="name" data-testid="plan-name-input" placeholder="Planname" required className="input"/>
      <select name="type" data-testid="plan-type-select" defaultValue="">
        <option value="" disabled>Typ wählen</option>
        <option value="strength">Strength</option>
        <option value="endurance">Endurance</option>
      </select>
      <textarea name="goal" data-testid="plan-goal-input" placeholder="Ziel" required className="textarea"/>
      <input type="number" name="weeks" data-testid="plan-weeks-input" min="1" max="52" defaultValue="8" className="input"/>
      <button type="submit" data-testid="plan-submit" disabled={isPending} className="btn">Plan anlegen</button>

      {!state?.ok && typeof state?.error === 'string' && (
        <p data-testid="plan-error" className="text-red-500 text-sm">{state.error}</p>
      )}
    </form>
  )
}

