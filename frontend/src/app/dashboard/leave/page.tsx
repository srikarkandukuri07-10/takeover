'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { CalendarCheck, CheckCircle2, XCircle, Clock, FileText, ArrowRight } from 'lucide-react'

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLeaveRequests()
      .then((data) => setLeaves(data.leaves || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
    total: leaves.length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Leave Management</h1>
        <p className="text-sm text-white/40">Monitor and manage employee time off requests</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-orange-500' },
          { label: 'Approved Requests', value: stats.approved, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
          { label: 'Rejected Requests', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-orange-500' },
          { label: 'Total Requests', value: stats.total, icon: CalendarCheck, color: 'from-blue-500 to-cyan-500' },
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
        <h2 className="text-sm font-semibold text-white/80">Leave Log</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-white/30">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <CalendarCheck className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No leave requests found</p>
            <p className="text-xs text-white/20">Employee leave applications will appear here</p>
          </GlassCard>
        ) : (
          leaves.map((leave, i) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{leave.employee?.full_name || 'Employee'}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                        leave.leave_type === 'sick'
                          ? 'bg-red-500/10 text-red-400'
                          : leave.leave_type === 'annual'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {leave.leave_type} leave
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      {leave.employee?.position} &bull; {leave.employee?.department}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 items-start md:items-center min-w-[200px]">
                    <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                      <span>{leave.start_date}</span>
                      <ArrowRight className="h-3 w-3 text-white/30" />
                      <span>{leave.end_date}</span>
                    </div>
                    <p className="text-3xs text-white/30 uppercase tracking-wider font-semibold mt-1">Duration Period</p>
                  </div>

                  <div className="flex-1 flex gap-2 items-start border-t border-white/[0.06] pt-4 md:border-t-0 md:pt-0">
                    <FileText className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-2xs text-white/40 uppercase tracking-wider font-semibold">Reason</p>
                      <p className="text-xs text-white/70 italic mt-0.5">&ldquo;{leave.reason || 'No reason provided'}&rdquo;</p>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-white/[0.06] pt-4 md:border-t-0 md:pt-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      leave.status === 'approved'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : leave.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        leave.status === 'approved'
                          ? 'bg-green-400'
                          : leave.status === 'rejected'
                          ? 'bg-red-400'
                          : 'bg-yellow-400 animate-pulse'
                      }`} />
                      {leave.status}
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

