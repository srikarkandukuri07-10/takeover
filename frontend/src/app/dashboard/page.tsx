'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { WorkflowTimeline } from '@/components/timeline/workflow-timeline'
import { useWorkflow } from '@/hooks/useWorkflow'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'
import {
  Sparkles,
  Users,
  Briefcase,
  Clock,
  Activity,
  Send,
  Bot,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { CardSkeleton, TimelineSkeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [event, setEvent] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const { workflow, steps, loading, error, execute, reset } = useWorkflow()

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event.trim()) return
    await execute(event.trim())
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            Mission Control
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-white/40"
          >
            Autonomous AI HR Operations Manager
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5"
        >
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400">AI Online</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statsLoading
          ? [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
          : [
              { label: 'Total Employees', value: stats?.total_employees || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: 'Active Now', value: stats?.active_employees || 0, icon: Activity, color: 'from-green-500 to-emerald-500' },
              { label: 'Open Positions', value: stats?.open_positions || 0, icon: Briefcase, color: 'from-purple-500 to-pink-500' },
              { label: 'Pending Approvals', value: stats?.pending_approvals || 0, icon: Clock, color: 'from-yellow-500 to-orange-500' },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-white/40">{card.label}</p>
                        <p className="mt-1 text-2xl font-bold text-white">{card.value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })
        }
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">AI Command Center</h2>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Describe a business event... (e.g., 'Hire Rahul as Backend Developer')"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 pr-20 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {event && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={reset}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={!event.trim() || loading}
                  className="h-8 px-3"
                  icon={<Send className="h-3.5 w-3.5" />}
                  loading={loading}
                >
                  Execute
                </Button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                'Hire Rahul as Backend Developer',
                'Priya requested leave',
                'Aman resigned today',
                'Review Sarah performance',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setEvent(suggestion)}
                  className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-white/40 hover:border-white/[0.12] hover:text-white/60 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </GlassCard>

          {error && (
            <GlassCard className="border-red-500/20 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="col-span-2">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">
                {steps.length > 0 ? 'Execution Timeline' : 'AI Status'}
              </h2>
            </div>

            {loading && steps.length === 0 ? (
              <TimelineSkeleton />
            ) : steps.length > 0 ? (
              <WorkflowTimeline
                steps={steps}
                status={workflow?.status || 'planning'}
                event={workflow?.event}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <Bot className="h-8 w-8 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-white/60">Awaiting Command</p>
                <p className="mt-1 text-xs text-white/30">
                  Describe a business event to begin
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {workflow?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 border-indigo-500/20">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Summary</h3>
                <p className="mt-1 text-sm text-white/60">{workflow.summary}</p>
                {workflow.workflow_type && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
                    <TrendingUp className="h-3 w-3" />
                    {workflow.workflow_type}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
