'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Brain,
  ClipboardList,
  Users,
  UserPlus,
  Monitor,
  Mail,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import type { WorkflowStep } from '@/types'

const moduleIcons: Record<string, React.ReactNode> = {
  recruitment: <Users className="h-4 w-4" />,
  onboarding: <UserPlus className="h-4 w-4" />,
  leave: <Calendar className="h-4 w-4" />,
  training: <BookOpen className="h-4 w-4" />,
  performance: <Sparkles className="h-4 w-4" />,
  promotion: <Sparkles className="h-4 w-4" />,
  payroll: <Monitor className="h-4 w-4" />,
  exit: <XCircle className="h-4 w-4" />,
}

const moduleColors: Record<string, string> = {
  recruitment: 'from-blue-500 to-cyan-500',
  onboarding: 'from-green-500 to-emerald-500',
  leave: 'from-yellow-500 to-orange-500',
  training: 'from-purple-500 to-pink-500',
  performance: 'from-indigo-500 to-violet-500',
  promotion: 'from-pink-500 to-rose-500',
  payroll: 'from-teal-500 to-cyan-500',
  exit: 'from-red-500 to-orange-500',
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <div className="h-2 w-2 rounded-full bg-white/20" />,
  in_progress: <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  status: string
  event?: string
}

export function WorkflowTimeline({ steps, status, event }: WorkflowTimelineProps) {
  const initialSteps = [
    { id: 'understand', module: 'ai', action: 'understanding', status: 'completed', description: 'Understanding Request' },
    { id: 'plan', module: 'ai', action: 'planning', status: steps.length > 0 ? 'completed' : 'in_progress', description: 'Planning Workflow' },
  ]

  const allSteps = [...initialSteps, ...steps]

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {allSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="workflow-step-enter"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative flex items-start gap-4 py-2">
              {index < allSteps.length - 1 && (
                <div className="absolute left-[17px] top-10 bottom-0 w-px bg-gradient-to-b from-white/[0.1] to-transparent" />
              )}

              <div
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500',
                  step.status === 'completed'
                    ? 'border-green-500/30 bg-green-500/10'
                    : step.status === 'in_progress'
                    ? 'border-indigo-500/30 bg-indigo-500/10 step-glow'
                    : step.status === 'failed'
                    ? 'border-red-500/30 bg-red-500/10'
                    : 'border-white/[0.08] bg-white/[0.03]'
                )}
              >
                {statusIcons[step.status] || statusIcons.pending}
              </div>

              <div className="flex-1 min-w-0 pt-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      step.status === 'completed'
                        ? 'text-green-400'
                        : step.status === 'in_progress'
                        ? 'text-indigo-300'
                        : step.status === 'failed'
                        ? 'text-red-400'
                        : 'text-white/40'
                    )}
                  >
                    {step.description || step.action}
                  </span>
                  {step.module !== 'ai' && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        step.status === 'completed'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-white/[0.05] text-white/40'
                      )}
                    >
                      {moduleIcons[step.module]}
                      {step.module}
                    </span>
                  )}
                </div>
                {step.status === 'in_progress' && (
                  <div className="mt-1.5 shimmer-bg h-4 rounded w-3/4" />
                )}
              </div>

              {step.status === 'completed' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {(status === 'completed' || status === 'failed') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mt-4"
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              status === 'completed'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {status === 'completed' ? 'Workflow Completed' : 'Workflow Failed'}
            </p>
            {event && (
              <p className="text-xs text-white/40">{event}</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
