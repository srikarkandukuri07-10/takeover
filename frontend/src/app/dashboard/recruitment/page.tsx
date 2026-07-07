'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { api } from '@/lib/api'
import { 
  Briefcase, MapPin, Clock, X, Sparkles, 
  User, CheckCircle2, MessageSquare, ShieldCheck, 
  HelpCircle, DollarSign, ListTodo
} from 'lucide-react'

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Mock candidates database for matching
  const getMockCandidates = (title: string) => {
    if (title.toLowerCase().includes('frontend')) {
      return [
        { name: "Rahul Gupta", match: 94, avatar: "RG", role: "React Architect", status: "Phone Screen Passed", reason: "Strong hands-on Next.js background & component library designs." },
        { name: "Vikram Sen", match: 86, avatar: "VS", role: "UI Engineer", status: "Technical Test", reason: "Good styling foundations but lacks SSR/Next.js production experience." }
      ]
    }
    return [
      { name: "Rohit Deshmukh", match: 91, avatar: "RD", role: "Software Architect", status: "AI Interview Scheduled", reason: "Deep database normalization & system design experience." },
      { name: "Neha Roy", match: 82, avatar: "NR", role: "Product Specialist", status: "Applied", reason: "Strong wireframing background but has limited technical project scope." }
    ]
  }

  // Mock AI interview transcript
  const mockInterviewTranscript = [
    { sender: "AI Interviewer", message: "Hi! Thanks for joining. Let's start with your experience: Can you explain how you handle state synchronization across components in Next.js?" },
    { sender: "Candidate (Rahul Gupta)", message: "Sure. I prefer using Zustand for local client state because of its lightweight setup, and React Query/SWR to sync server state. With Next.js 13+ App Router, I leverage Server Actions and route handlers to handle data mutations." },
    { sender: "AI Evaluation Node", message: "Grade: 4.8/5.0. Excellent demonstration of modern Next.js paradigms and state isolation separation." },
    { sender: "AI Interviewer", message: "Great. How do you optimize web vital scores, specifically Cumulative Layout Shift (CLS)?" },
    { sender: "Candidate (Rahul Gupta)", message: "I ensure all media/images have explicit width/height dimensions or utilize Next.js next/image. I also reserve height spacing for dynamic elements like ads using CSS placeholders." }
  ]

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-10rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Recruitment Pipeline</h1>
        <p className="text-sm text-white/40">AI-powered candidate searching, automated screening interviews, and hiring logs</p>
      </motion.div>

      {loading ? (
        <div className="py-12 text-center text-sm text-white/30">Loading openings...</div>
      ) : jobs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Briefcase className="mx-auto mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No job openings yet</p>
          <p className="text-xs text-white/20">Use the AI Command Center to post new positions</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, i) => (
            <motion.div 
              key={job.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard 
                hover 
                className="p-5 cursor-pointer group"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-cyan-500/10 shrink-0">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{job.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location || 'Remote'}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.department}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                      {job.status}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide-out Job Details Drawer overlay */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 z-40 bg-black"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-screen w-full max-w-lg bg-slate-950 border-l border-white/[0.08] p-6 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Hiring Workspace</h2>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Job Info Summary */}
              <div className="rounded-xl bg-white/[0.01] border border-white/[0.04] p-5 space-y-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedJob.title}</h3>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">{selectedJob.department} &bull; {selectedJob.location || 'Remote'}</p>
                </div>
                
                <p className="text-xs text-white/60 leading-relaxed">
                  {selectedJob.description || 'Hiring a qualified expert to join our expanding team.'}
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4">
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Salary Range
                    </span>
                    <p className="text-xs text-white/70 font-semibold font-mono mt-0.5">{selectedJob.salary_range || '$80,000 - $120,000'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <ListTodo className="h-3 w-3" /> Requirements
                    </span>
                    <p className="text-2xs text-white/50 mt-0.5 truncate">{selectedJob.requirements || '3+ years experience, Strong communication'}</p>
                  </div>
                </div>
              </div>

              {/* Match Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <ShieldCheck className="h-4 w-4" />
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold">AI Sourced Candidates</h4>
                </div>

                <div className="space-y-3">
                  {getMockCandidates(selectedJob.title).map((cand, idx) => (
                    <div key={idx} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-400">
                            {cand.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{cand.name}</p>
                            <p className="text-[10px] text-white/40">{cand.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">Match Score</p>
                          <p className="text-xs font-bold text-green-400">{cand.match}%</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/50 italic">&ldquo;{cand.reason}&rdquo;</p>
                      <div className="flex justify-between items-center pt-1.5 border-t border-white/[0.04]">
                        <span className="text-[10px] text-white/30">Interview Pipeline Status:</span>
                        <span className="text-[10px] text-cyan-300 font-semibold">{cand.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live transcript simulator */}
              {selectedJob.title.toLowerCase().includes('frontend') && (
                <div className="border-t border-white/[0.06] pt-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <MessageSquare className="h-4 w-4" />
                    <h4 className="text-[10px] uppercase tracking-wider font-semibold">AI Phone Screen Transcript</h4>
                  </div>

                  <div className="rounded-xl bg-indigo-500/[0.01] border border-indigo-500/10 p-4 space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {mockInterviewTranscript.map((t, idx) => (
                      <div key={idx} className={`text-2xs leading-relaxed p-2 rounded-lg ${
                        t.sender.startsWith('AI Evaluation')
                          ? 'bg-green-500/5 border border-green-500/20 text-green-400 font-mono'
                          : t.sender.startsWith('AI')
                          ? 'bg-indigo-500/5 text-indigo-300'
                          : 'bg-white/5 text-white/70'
                      }`}>
                        <p className="font-bold text-[9px] uppercase tracking-wider opacity-60 mb-0.5">{t.sender}</p>
                        <p>{t.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

