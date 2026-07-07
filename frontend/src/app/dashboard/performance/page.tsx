'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { TrendingUp, Star, Target, MessageSquare, AlertCircle, Award, Frown, Sparkles } from 'lucide-react'

export default function PerformancePage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPerformanceReviews()
      .then((data) => setReviews(data.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    avg_rating: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + parseFloat(r.overall_rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0',
    total_reviews: reviews.length,
    drafts: reviews.filter(r => r.status === 'draft').length,
    published: reviews.filter(r => r.status === 'published').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Performance Management</h1>
        <p className="text-sm text-white/40">AI-generated performance evaluations and reviewer assignments</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Avg Rating', value: stats.avg_rating, icon: Star, color: 'from-yellow-500 to-orange-500' },
          { label: 'Reviews Completed', value: stats.total_reviews, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
          { label: 'Drafts', value: stats.drafts, icon: Target, color: 'from-blue-500 to-cyan-500' },
          { label: 'Feedbacks Sent', value: stats.published, icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
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
        <h2 className="text-sm font-semibold text-white/80">Reviews Log</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-white/30">Loading performance reviews...</div>
        ) : reviews.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Star className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No reviews generated yet</p>
            <p className="text-xs text-white/20">AI reviews will appear here once performance workflows are executed</p>
          </GlassCard>
        ) : (
          reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Top section: Employee info & Overall rating */}
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-base font-semibold text-white">{r.employee?.full_name || 'Employee'}</h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        {r.employee?.position} &bull; {r.employee?.department} &bull; <span className="italic">{r.period}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-xl">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">{parseFloat(r.overall_rating || 0).toFixed(1)}</span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                        r.status === 'published'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-white/5 text-white/50 border border-white/[0.06]'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-xs text-white/70 leading-relaxed">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">AI Executive Summary</p>
                    &ldquo;{r.summary}&rdquo;
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-1.5 text-2xs font-semibold text-green-400 uppercase tracking-wider">
                        <Award className="h-3.5 w-3.5" /> Key Strengths
                      </h4>
                      <ul className="space-y-1 text-xs text-white/60">
                        {r.strengths?.map((str: string, sIdx: number) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">&bull;</span>
                            {str}
                          </li>
                        ))}
                        {(!r.strengths || r.strengths.length === 0) && <li className="italic text-white/30">None documented</li>}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="flex items-center gap-1.5 text-2xs font-semibold text-indigo-400 uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5" /> Improvement Areas
                      </h4>
                      <ul className="space-y-1 text-xs text-white/60">
                        {r.weaknesses?.map((weak: string, wIdx: number) => (
                          <li key={wIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 mt-0.5">&bull;</span>
                            {weak}
                          </li>
                        ))}
                        {(!r.weaknesses || r.weaknesses.length === 0) && <li className="italic text-white/30">None documented</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Reviewer details */}
                  <div className="flex items-center justify-end text-3xs text-white/30 border-t border-white/[0.06] pt-3">
                    Evaluated by <span className="text-white/50 ml-1 font-medium">{r.reviewer?.full_name || 'Sneha Gupta'}</span> &bull; HR Operations Manager
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

