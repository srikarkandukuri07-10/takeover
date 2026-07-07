'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { GraduationCap, CheckCircle2, Clock, Mail, Laptop, Calendar, Check, AlertCircle } from 'lucide-react'

export default function OnboardingPage() {
  const [onboardings, setOnboardings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getOnboardings()
      .then((data) => setOnboardings(data.onboardings || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    pending: onboardings.filter(o => o.status === 'pending').length,
    in_progress: onboardings.filter(o => o.status === 'in_progress').length,
    completed: onboardings.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Employee Onboarding</h1>
        <p className="text-sm text-white/40">Track the onboarding progress of new team members</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Onboarding', value: stats.pending, color: 'from-yellow-500 to-orange-500', icon: Clock },
          { label: 'In Progress', value: stats.in_progress, color: 'from-blue-500 to-cyan-500', icon: GraduationCap },
          { label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: CheckCircle2 },
        ].map((card) => {
          const Icon = card.icon
          return (
            <GlassCard key={card.label} className="p-5">
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
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Active Onboarding Pipelines</h2>
        
        {loading ? (
          <div className="py-12 text-center text-sm text-white/30">Loading onboarding workflows...</div>
        ) : onboardings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No active onboardings</p>
            <p className="text-xs text-white/20">Trigger a hiring workflow to see it here</p>
          </GlassCard>
        ) : (
          onboardings.map((onb, i) => (
            <motion.div
              key={onb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{onb.employee?.full_name || 'New Joiner'}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider ${
                        onb.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : onb.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {onb.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      {onb.employee?.position} &bull; {onb.employee?.department}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-4 md:border-t-0 md:pt-0">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-1 ${onb.company_email ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {onb.company_email ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Email</p>
                        <p className="text-2xs text-white/60 font-mono truncate max-w-[120px]" title={onb.company_email || 'Not generated'}>
                          {onb.company_email || 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-1 ${onb.laptop_allocated ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {onb.laptop_allocated ? <Check className="h-3.5 w-3.5" /> : <Laptop className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">IT Asset</p>
                        <p className="text-2xs text-white/60">
                          {onb.laptop_allocated ? 'Allocated' : 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-1 ${onb.orientation_scheduled ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {onb.orientation_scheduled ? <Check className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Orientation</p>
                        <p className="text-2xs text-white/60">
                          {onb.orientation_scheduled ? 'Scheduled' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

