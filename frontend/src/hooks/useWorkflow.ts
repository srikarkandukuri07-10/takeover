'use client'
import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Workflow, WorkflowStep } from '@/types'

export function useWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (event: string) => {
    setLoading(true)
    setError(null)
    setSteps([])

    try {
      const result = await api.executeWorkflow(event)

      const wf: Workflow = {
        id: result.id,
        event: result.event,
        workflow_type: result.workflow_type,
        status: result.status,
        steps: result.steps || [],
        summary: result.summary,
        created_at: result.created_at,
        completed_at: result.completed_at,
      }

      setWorkflow(wf)

      const allSteps = result.steps || []
      for (let i = 0; i < allSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 800))
        const step: WorkflowStep = {
          id: allSteps[i].id,
          workflow_id: wf.id,
          module: allSteps[i].module,
          action: allSteps[i].action,
          status: allSteps[i].status,
          description: allSteps[i].description,
          result: allSteps[i].result,
        }

        const failureStep: WorkflowStep = {
          ...step,
          status: 'in_progress' as const,
        }

        setSteps((prev) => [...prev, failureStep])

        await new Promise((r) => setTimeout(r, 600))

        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: allSteps[i].status as WorkflowStep['status'] }
              : s
          )
        )
      }

      return wf
    } catch (err: any) {
      setError(err.message || 'Failed to execute workflow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setWorkflow(null)
    setSteps([])
    setError(null)
  }, [])

  return { workflow, steps, loading, error, execute, reset }
}
