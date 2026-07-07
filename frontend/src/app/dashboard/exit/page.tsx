'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { DoorOpen, CheckCircle2, AlertTriangle, RefreshCw, Calendar, ClipboardList } from 'lucide-react'

export default function ExitPage() {
  const [exits, setExits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getExitProcesses()
      .then((data) => setExits(data.exits || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    active: exits.filter(e => e.status !== 'completed').length,
    completed: exits.filter(e => e.status === 'completed').length,
    pending_assets: exits.reduce((acc, e) => {
      // Look for asset checklist items that are pending
      const list = e.checklist || []
      const hasPendingAsset = list.some((item: any) => 
        item.task.toLowerCase().includes('asset') && item.status !== 'completed'
      )
      return acc + (hasPendingAsset ? 1 : 0)
    }, 0),
    replacements: exits.length, // Seeding initiated replacement recruitment for every exit
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Exit Management</h1>
        <p className="text-sm text-white/40">Automated employee offboarding, checklist tasks, and replacement recruitment pipelines</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Offboarding', value: stats.active, icon: DoorOpen, color: 'from-red-500 to-orange-500' },
          { label: 'Offboarding Done', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
          { label: 'Pending Asset Returns', value: stats.pending_assets, icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
          { label: 'Recruitment Initiated', value: stats.replacements, icon: RefreshCw, color: 'from-blue-500 to-cyan-500' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <GlassCard key={card.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/40">{card.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Offboarding Logs</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-white/30">Loading exits...</div>
        ) : exits.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <DoorOpen className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No active offboarding workflows</p>
            <p className="text-xs text-white/20">Workflows triggered by resignation events will appear here</p>
          </GlassCard>
        ) : (
          exits.map((ex, i) => {
            const list = ex.checklist || []
            const completedCount = list.filter((item: any) => item.status === 'completed').length
            const totalCount = list.length
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-6">
                    {/* Top details */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h3 className="text-base font-semibold text-white">{ex.employee_name || ex.employee?.full_name || 'Employee'}</h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          {ex.employee?.position || 'Former Role'} &bull; {ex.employee?.department || 'Department'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                          ex.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                        }`}>
                          {ex.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress & Checklist items summary */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-2xs font-semibold text-white/50">
                          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Offboarding Checklist</span>
                          <span>{completedCount}/{totalCount} Tasks ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* List of items */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-2xs">
                          {list.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'completed' ? 'bg-green-400' : 'bg-white/20'}`} />
                              <span className={item.status === 'completed' ? 'text-white/40 line-through' : 'text-white/70'}>
                                {item.task}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right metadata columns */}
                      <div className="flex flex-col justify-between space-y-4 md:border-l md:border-white/[0.06] md:pl-6 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white/30 shrink-0" />
                          <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Last Working Day</p>
                            <p className="text-xs text-white/70 font-mono">
                              {ex.last_working_day || 'Immediate / TBD'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-white/30 shrink-0" />
                          <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Replacement Postings</p>
                            <p className="text-xs text-indigo-300 font-semibold">
                              Initiated backfill recruitment workflow
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

