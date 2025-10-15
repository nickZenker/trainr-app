'use server'
import { revalidatePath } from "next/cache";
import { updatePlan, duplicatePlan, softDeletePlan } from '@/services/plans'

export async function updatePlanAction(prevState, formData) {
  try {
    const planId = String(formData.get('planId')||'')
    const name = String(formData.get('name')||'').trim()
    const goal = String(formData.get('goal')||'').trim()
    const weeks = Number(formData.get('weeks')||0)
    const type = formData.get('type') ? String(formData.get('type')) : undefined

    if (!planId) return { ok:false, error:'Plan ID ist erforderlich' }
    if (!name) return { ok:false, error:'Name ist erforderlich' }
    if (!goal) return { ok:false, error:'Ziel ist erforderlich' }
    if (!Number.isFinite(weeks) || weeks < 1 || weeks > 52) return { ok:false, error:'Wochen muss 1–52 sein' }

    const result = await updatePlan(planId, { name, goal, weeks, type })
    
    if (result.success) {
      revalidatePath('/app/plans');
      return { ok:true, message: result.message }
    } else {
      return { ok:false, error: result.message || 'Plan konnte nicht aktualisiert werden' }
    }
  } catch (e) {
    // Log to OUTBOX
    fetch('/api/log', { 
      method:'POST', 
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind:'plan-action', message: e?.message || String(e) }) 
    }).catch(() => {})
    
    return { ok:false, error: e?.message || String(e) || 'Plan konnte nicht aktualisiert werden' }
  }
}

export async function duplicatePlanAction(prevState, formData) {
  try {
    const planId = String(formData.get('planId')||'')
    
    if (!planId) return { ok:false, error:'Plan ID ist erforderlich' }

    const result = await duplicatePlan(planId)
    
    if (result.success) {
      revalidatePath('/app/plans');
      return { ok:true, message: result.message }
    } else {
      return { ok:false, error: result.message || 'Plan konnte nicht dupliziert werden' }
    }
  } catch (e) {
    // Log to OUTBOX
    fetch('/api/log', { 
      method:'POST', 
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind:'plan-action', message: e?.message || String(e) }) 
    }).catch(() => {})
    
    return { ok:false, error: e?.message || String(e) || 'Plan konnte nicht dupliziert werden' }
  }
}

export async function softDeletePlanAction(prevState, formData) {
  try {
    const planId = String(formData.get('planId')||'')
    
    if (!planId) return { ok:false, error:'Plan ID ist erforderlich' }

    const result = await softDeletePlan(planId)
    
    if (result.success) {
      revalidatePath('/app/plans');
      return { ok:true, message: result.message }
    } else {
      return { ok:false, error: result.message || 'Plan konnte nicht gelöscht werden' }
    }
  } catch (e) {
    // Log to OUTBOX
    fetch('/api/log', { 
      method:'POST', 
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind:'plan-action', message: e?.message || String(e) }) 
    }).catch(() => {})
    
    return { ok:false, error: e?.message || String(e) || 'Plan konnte nicht gelöscht werden' }
  }
}
