'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { BookOpen, TrendingUp, Award, Target, User, Calendar } from 'lucide-react'

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTrainingPrograms()
      .then((data) => setTrainings(data.trainings || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    active: trainings.filter(t => t.status === 'in_progress' || t.status === 'assigned').length,
    completed: trainings.filter(t => t.status === 'completed').length,
    avg_progress: trainings.length > 0 
      ? Math.round(trainings.reduce((acc, t) => acc + (t.progress_percentage || 0), 0) / trainings.length)
      : 0,
    mentors: new Set(trainings.map(t => t.mentor_id).filter(Boolean)).size,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Learning & Training</h1>
        <p className="text-sm text-white/40">AI-generated employee training roadmaps and mentor assignments</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Programs', value: stats.active, icon: BookOpen, color: 'from-purple-500 to-pink-500' },
          { label: 'Avg Progress', value: `${stats.avg_progress}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
          { label: 'Completed Roadmaps', value: stats.completed, icon: Award, color: 'from-yellow-500 to-orange-500' },
          { label: 'Active Mentors', value: stats.mentors, icon: Target, color: 'from-blue-500 to-cyan-500' },
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
        <h2 className="text-sm font-semibold text-white/80">Active Learning Roadmaps</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-white/30">Loading training programs...</div>
        ) : trainings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No learning plans assigned</p>
            <p className="text-xs text-white/20">Learning roadmaps generated during onboarding will show up here</p>
          </GlassCard>
        ) : (
          trainings.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{t.program_name}</h3>
                    <p className="text-xs text-white/40 mt-1">
                      Assigned to <span className="text-white/60 font-medium">{t.employee?.full_name || 'Employee'}</span> &bull; {t.employee?.position}
                    </p>
                  </div>

                  <div className="flex-1 min-w-[200px] space-y-1">
                    <div className="flex justify-between text-2xs font-semibold text-white/50">
                      <span>Course Progress</span>
                      <span>{t.progress_percentage || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                        style={{ width: `${t.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-[150px]">
                    <User className="h-4 w-4 text-white/30 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Mentor</p>
                      <p className="text-xs text-white/70">
                        {t.mentor?.full_name || 'Awaiting Assignment'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Calendar className="h-4 w-4 text-white/30 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Start Date</p>
                      <p className="text-xs text-white/70 font-mono">
                        {t.start_date || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <span className={`rounded-full px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                      t.status === 'completed'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : t.status === 'in_progress'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {t.status}
                    </span>
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

