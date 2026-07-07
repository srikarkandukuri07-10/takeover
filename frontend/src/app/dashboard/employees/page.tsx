'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import type { Employee } from '@/types'
import { 
  Users, Mail, Briefcase, Building2, BadgeCheck, 
  X, AlertTriangle, Heart, Network, List, 
  DollarSign, Calendar, ShieldAlert, ArrowRight 
} from 'lucide-react'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'org'>('list')
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEmployees()
      .then((data) => setEmployees(data.employees || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Mock flight risk calculator based on salary & department
  const getFlightRisk = (emp: Employee) => {
    let risk = 15 // base
    if (emp.salary && emp.salary < 80000) risk += 25
    if (emp.department === 'Engineering') risk += 10
    if (emp.full_name.includes('Aman') || emp.full_name.includes('Rohit')) risk += 45 // flight risks for demo
    return Math.min(risk, 95)
  }

  const getRiskColor = (risk: number) => {
    if (risk > 70) return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (risk > 40) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    return 'text-green-400 bg-green-500/10 border-green-500/20'
  }

  // Find manager name
  const getManagerName = (managerId: string | null | undefined) => {
    if (!managerId) return 'None (Reporting to CEO)'
    const manager = employees.find(e => e.id === managerId)
    return manager ? manager.full_name : 'Sneha Gupta'
  }

  // Find direct reports
  const getDirectReports = (empId: string) => {
    return employees.filter(e => e.manager_id === empId)
  }

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Employees Directory</h1>
          <p className="text-sm text-white/40">View rosters, organizational charts, and AI-predicted retention risks</p>
        </motion.div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/[0.08] self-start">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === 'list' 
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <List className="h-3.5 w-3.5" /> List View
          </button>
          <button
            onClick={() => setViewMode('org')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === 'org' 
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" /> Org Chart
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-white/30">Loading directory...</div>
      ) : employees.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No employees yet</p>
          <p className="text-xs text-white/20">Run onboarding events to add team members</p>
        </GlassCard>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-4"
            >
              {employees.map((emp, i) => {
                const risk = getFlightRisk(emp)
                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <GlassCard 
                      hover 
                      className="p-5 cursor-pointer relative overflow-hidden group"
                      onClick={() => setSelectedEmp(emp)}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shrink-0 shadow-lg shadow-indigo-500/10">
                            {emp.full_name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{emp.full_name}</h3>
                              {emp.status === 'active' && <BadgeCheck className="h-4 w-4 text-green-400" />}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{emp.email}</span>
                              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{emp.position}</span>
                              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{emp.department}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          {/* Flight Risk indicator */}
                          <div className={`rounded-full px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider border ${getRiskColor(risk)}`}>
                            Flight Risk: {risk}%
                          </div>

                          <div className="text-right hidden md:block">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Employee ID</p>
                            <p className="text-xs font-mono text-white/60 font-semibold">{emp.employee_id}</p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            // Simple interactive Org Chart layout
            <motion.div
              key="org-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-6 overflow-x-auto min-w-full"
            >
              {/* Executive / Top Manager node */}
              <div className="flex flex-col items-center mb-8">
                <div 
                  className="rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/40 p-4 text-center cursor-pointer hover:border-indigo-400 transition-all shadow-xl shadow-indigo-500/5 max-w-[200px]"
                  onClick={() => setSelectedEmp(employees.find(e => e.department === 'Human Resources') || employees[0])}
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Department Head</p>
                  <p className="font-semibold text-white mt-1">Sneha Gupta</p>
                  <p className="text-2xs text-white/40 mt-0.5">HR Manager</p>
                </div>
                
                {/* Connecting branch lines */}
                <div className="h-8 w-0.5 bg-white/10 mt-2" />
                <div className="h-0.5 w-[80%] bg-white/10" />
              </div>

              {/* Sub-node reports grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-4">
                {employees.filter(e => e.department !== 'Human Resources').map((emp) => {
                  const risk = getFlightRisk(emp)
                  return (
                    <div key={emp.id} className="flex flex-col items-center">
                      <div className="h-4 w-0.5 bg-white/10 mb-2" />
                      <div 
                        onClick={() => setSelectedEmp(emp)}
                        className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 p-4 text-center cursor-pointer hover:bg-white/[0.04] transition-all max-w-[160px] w-full"
                      >
                        <p className="font-medium text-xs text-white truncate">{emp.full_name}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 truncate">{emp.position}</p>
                        <div className="mt-2.5 flex items-center justify-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${risk > 70 ? 'bg-red-400' : risk > 40 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                          <span className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Risk: {risk}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Slide-out Employee Details Drawer overlay */}
      <AnimatePresence>
        {selectedEmp && (
          <>
            {/* Dark background backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmp(null)}
              className="fixed inset-0 z-40 bg-black"
            />

            {/* Slideout panel container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-slate-950 border-l border-white/[0.08] p-6 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Employee HR File</h2>
                </div>
                <button 
                  onClick={() => setSelectedEmp(null)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Profile card summary */}
              <div className="text-center py-6 border-b border-white/[0.06] mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-xl shadow-indigo-500/10">
                  {selectedEmp.full_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <h3 className="text-lg font-bold text-white mt-3">{selectedEmp.full_name}</h3>
                <p className="text-xs text-indigo-400 font-medium">{selectedEmp.position} &bull; {selectedEmp.department}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-green-400 border border-green-500/20">
                    {selectedEmp.status}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-2xs font-mono text-white/50 border border-white/[0.06]">
                    {selectedEmp.employee_id}
                  </span>
                </div>
              </div>

              {/* HR Metadata details grid */}
              <div className="space-y-5">
                <h4 className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Contract Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-xs">
                    <p className="text-white/30 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Current Salary</p>
                    <p className="mt-1 font-mono font-bold text-white text-sm">
                      {selectedEmp.salary ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(selectedEmp.salary) : 'TBD'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-xs">
                    <p className="text-white/30 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Start Date</p>
                    <p className="mt-1 font-mono font-semibold text-white text-sm">
                      {selectedEmp.start_date || '2024-01-15'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-xs space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/30">Reporting Line Manager</span>
                    <span className="text-white/70 font-medium">{getManagerName(selectedEmp.manager_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Direct Reports Count</span>
                    <span className="text-white/70 font-semibold">{getDirectReports(selectedEmp.id).length} reports</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Corporate Email Address</span>
                    <span className="text-white/70 font-mono select-all hover:text-indigo-300 transition-colors">{selectedEmp.email}</span>
                  </div>
                </div>

                {/* AI Flight Risk analysis block */}
                <div className="border-t border-white/[0.06] pt-5">
                  <div className="flex items-center gap-1.5 mb-3 text-red-400">
                    <ShieldAlert className="h-4 w-4" />
                    <h4 className="text-[10px] uppercase tracking-wider font-semibold">AI Flight Risk Audit</h4>
                  </div>

                  <div className="rounded-xl bg-red-500/[0.02] border border-red-500/10 p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Calculated Attrition Risk</span>
                      <span className={`font-bold font-mono text-sm ${
                        getFlightRisk(selectedEmp) > 70 ? 'text-red-400 animate-pulse' : getFlightRisk(selectedEmp) > 40 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {getFlightRisk(selectedEmp)}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          getFlightRisk(selectedEmp) > 70 ? 'bg-red-500' : getFlightRisk(selectedEmp) > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${getFlightRisk(selectedEmp)}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-white/50 leading-relaxed pt-2 border-t border-white/[0.04]">
                      <p className="font-semibold text-white/80">Primary Risk Factor:</p>
                      <p className="mt-0.5 italic">
                        {getFlightRisk(selectedEmp) > 70 
                          ? "High risk associated with market salary gaps and departmental workload benchmarks."
                          : "Low flight risk. Employee showing strong alignment with current compensation ranges."
                        }
                      </p>
                      <p className="font-semibold text-white/80 mt-2.5">AI Retention Action Plan:</p>
                      <p className="mt-0.5 flex items-center gap-1 text-indigo-300 font-medium">
                        <ArrowRight className="h-3 w-3" />
                        {getFlightRisk(selectedEmp) > 70 
                          ? "Schedule a mid-term salary review or assign structured skill roadmaps."
                          : "Continue standard quarterly feedback cadence."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

