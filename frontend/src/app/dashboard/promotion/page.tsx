'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { ArrowUpCircle, DollarSign, Award, TrendingUp, Sparkles, ArrowRight, HelpCircle } from 'lucide-react'

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPromotions()
      .then((data) => setPromotions(data.promotions || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    eligible: promotions.filter(p => parseFloat(p.eligibility_score || 0) >= 80).length,
    total: promotions.length,
    salary_revisions: promotions.reduce((acc, p) => acc + (parseFloat(p.new_salary || 0) - parseFloat(p.current_salary || 0)), 0),
    approved: promotions.filter(p => p.status === 'approved').length,
  }

  const formatCurrency = (val: any) => {
    const num = parseFloat(val || 0)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Promotion & Revisions</h1>
        <p className="text-sm text-white/40">Track promotion proposals, salary increments, and suitability evaluations</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Eligible Staff', value: stats.eligible, icon: Award, color: 'from-purple-500 to-pink-500' },
          { label: 'Proposals Count', value: stats.total, icon: ArrowUpCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Increment Overhead', value: formatCurrency(stats.salary_revisions), icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
          { label: 'Approved Proposals', value: stats.approved, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
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
        <h2 className="text-sm font-semibold text-white/80">Active Proposals</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-white/30">Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No promotion proposals yet</p>
            <p className="text-xs text-white/20">Promotion assessment actions will show up here</p>
          </GlassCard>
        ) : (
          promotions.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Top Header */}
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-base font-semibold text-white">{p.employee?.full_name || 'Employee'}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                        <span>{p.current_position}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                        <span className="text-indigo-400 font-semibold">{p.new_position}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-3xs text-white/30 uppercase tracking-wider font-semibold">Suitability Score</p>
                        <p className="text-sm font-bold text-green-400">{parseFloat(p.eligibility_score || 0).toFixed(0)}%</p>
                      </div>
                      
                      <span className={`rounded-full px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                        p.status === 'approved'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : p.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>

                  {/* Recommendation block */}
                  <div className="flex gap-3 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl text-xs text-white/70">
                    <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-3xs text-white/30 uppercase tracking-wider font-semibold mb-1">AI Recommendation Details</p>
                      <p className="italic">&ldquo;{p.ai_recommendation}&rdquo;</p>
                    </div>
                  </div>

                  {/* Compensation changes */}
                  <div className="grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-4 text-xs">
                    <div>
                      <p className="text-3xs text-white/30 uppercase tracking-wider font-semibold">Current Salary</p>
                      <p className="mt-1 font-mono text-white/80 font-semibold">{formatCurrency(p.current_salary)}</p>
                    </div>

                    <div>
                      <p className="text-3xs text-white/30 uppercase tracking-wider font-semibold">Proposed Salary</p>
                      <p className="mt-1 font-mono text-indigo-300 font-bold">{formatCurrency(p.new_salary)}</p>
                    </div>

                    <div>
                      <p className="text-3xs text-white/30 uppercase tracking-wider font-semibold">Increment Boost</p>
                      <p className="mt-1 text-green-400 font-semibold font-mono">
                        +{formatCurrency(parseFloat(p.new_salary || 0) - parseFloat(p.current_salary || 0))} (+{
                          p.current_salary > 0 
                            ? (( (parseFloat(p.new_salary) - parseFloat(p.current_salary)) / parseFloat(p.current_salary) ) * 100).toFixed(0) 
                            : '15'
                        }%)
                      </p>
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

