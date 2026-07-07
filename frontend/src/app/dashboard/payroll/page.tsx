'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { 
  DollarSign, AlertTriangle, CheckCircle2, 
  Activity, Info, Fingerprint, RefreshCw, Sparkles 
} from 'lucide-react'

export default function PayrollPage() {
  const [exceptions, setExceptions] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.getPayrollExceptions(),
      api.getEmployees()
    ])
      .then(([excData, empData]) => {
        setExceptions(excData.exceptions || [])
        setEmployees(empData.employees || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = {
    detected: exceptions.filter(e => e.status === 'detected' || e.status === 'under_review').length,
    resolved: exceptions.filter(e => e.status === 'resolved').length,
    pending: exceptions.filter(e => e.status === 'under_review').length,
    total_adjustments: exceptions.reduce((acc, e) => acc + parseFloat(e.adjustment_amount || 0), 0),
  }

  const formatCurrency = (val: any) => {
    const num = parseFloat(val || 0)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
  }

  // Simulate a new biometric check-in anomaly
  const handleSimulate = async () => {
    if (employees.length === 0) return
    setSimulating(true)
    setNotification(null)

    // Pick random employee
    const emp = employees[Math.floor(Math.random() * employees.length)]
    
    // Choose issue config
    const issues = [
      {
        type: "Missing Clock-Out",
        desc: `Biometric terminal detected ${emp.full_name} clocking in at 09:00 AM, but failed to record a sign-out event.`,
        amount: -45.00,
        severity: "medium"
      },
      {
        type: "Unscheduled Overtime",
        desc: `Biometric database matches overtime logs of 4.5 hours for ${emp.full_name} outside their designated shifts.`,
        amount: 180.00,
        severity: "high"
      },
      {
        type: "Biometric Device Desync",
        desc: `Hardware desynchronization occurred on Floor 3 terminal. Missing timesheets recorded for ${emp.full_name}.`,
        amount: -125.00,
        severity: "critical"
      }
    ]
    const issue = issues[Math.floor(Math.random() * issues.length)]

    const newException = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      employee_id: emp.id,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear().toString(),
      issue_type: issue.type,
      description: issue.desc,
      adjustment_amount: issue.amount,
      status: 'detected',
      severity: issue.severity,
      created_at: new Date().toISOString()
    }

    try {
      const res = await api.createPayrollException(newException)
      if (res.success) {
        setNotification(`Simulated biometric anomaly logged for ${emp.full_name}!`)
        // Refresh exception log
        const updated = await api.getPayrollExceptions()
        setExceptions(updated.exceptions || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSimulating(false)
    }
  }

  // Auto-Resolve Exception with AI
  const handleResolve = async (exId: string, empName: string, amount: number) => {
    try {
      const res = await api.updatePayrollException(exId, { 
        status: "resolved",
        description: `Resolved by AI: Discrepancy reconciled. Correction payroll offset of ${formatCurrency(amount)} applied.`
      })
      if (res.success) {
        setNotification(`AI successfully reconciled timesheet for ${empName}!`)
        // Reload page data
        const updated = await api.getPayrollExceptions()
        setExceptions(updated.exceptions || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Payroll & Biometrics</h1>
          <p className="text-sm text-white/40">AI-driven biometric anomaly checking, payroll discrepancy logs, and auto-resolution</p>
        </motion.div>
        
        {/* Toast Notification */}
        {notification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs text-indigo-400 font-medium"
          >
            {notification}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Side: Stats and Exceptions Log */}
        <div className="col-span-3 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Issues', value: stats.detected, icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
              { label: 'Total Offsets', value: formatCurrency(stats.total_adjustments), icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
            ].map((card) => {
              const Icon = card.icon
              return (
                <GlassCard key={card.label} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] text-white/40">{card.label}</p>
                      <p className="mt-1 text-base font-bold text-white">{card.value}</p>
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10 shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/80">Exceptions Log</h2>

            {loading ? (
              <div className="py-12 text-center text-sm text-white/30">Loading exceptions...</div>
            ) : exceptions.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-white/20" />
                <p className="text-sm text-white/40">No payroll anomalies detected</p>
                <p className="text-xs text-white/20">Biometric discrepancies generated on the simulator will show up here</p>
              </GlassCard>
            ) : (
              exceptions.map((ex) => (
                <GlassCard key={ex.id} className="p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{ex.employee?.full_name || 'Employee'}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${
                            ex.severity === 'critical'
                              ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                              : ex.severity === 'high'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {ex.severity} severity
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                          {ex.employee?.position || 'Roster Role'} &bull; {ex.employee?.department || 'Department'}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-semibold ${
                        ex.status === 'resolved'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${ex.status === 'resolved' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        {ex.status}
                      </span>
                    </div>

                    <div className="flex gap-2 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl text-xs text-white/60">
                      <Info className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                      <p>{ex.description}</p>
                    </div>

                    <div className="flex flex-wrap justify-between items-center border-t border-white/[0.06] pt-3 text-xs gap-3">
                      <div>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Compensation Impact</span>
                        <p className={`mt-0.5 font-mono font-bold ${parseFloat(ex.adjustment_amount || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(ex.adjustment_amount || 0) >= 0 ? '+' : ''}{formatCurrency(ex.adjustment_amount)}
                        </p>
                      </div>

                      {ex.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(ex.id, ex.employee?.full_name || 'Employee', ex.adjustment_amount)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white px-2.5 py-1 text-2xs font-semibold transition-all shadow-lg shadow-indigo-500/10"
                        >
                          <Sparkles className="h-3 w-3" /> Auto-Resolve with AI
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Biometric Hardware Simulator */}
        <div className="col-span-2 space-y-6">
          <GlassCard className="p-5 border-indigo-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Biometric Terminal Simulator</h2>
            </div>
            
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              Simulate real-time biometric hardware clock-in/clock-out events. Generate mismatch anomalies to test the AI HR agent's automated auditing capabilities.
            </p>

            <button
              onClick={handleSimulate}
              disabled={simulating || employees.length === 0}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-2.5 text-xs font-semibold transition-all shadow-xl shadow-indigo-500/10 disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Simulating Anomaly...
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4" /> Simulate Biometric Anomaly
                </>
              )}
            </button>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-2xs uppercase tracking-wider font-bold text-white/40 mb-3">System Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span className="text-white/40">Terminal Status</span>
                <span className="text-green-400 font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Online</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span className="text-white/40">Audit Mode</span>
                <span className="text-indigo-400 font-medium">Continuous Real-Time</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Registered Staff</span>
                <span className="text-white/80 font-bold">{employees.length} employees</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}


