'use client'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Settings, Shield, Bell, Database, Bot } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/40">System configuration</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'AI Provider', value: 'Groq', desc: 'LLM provider for AI orchestration', icon: Bot, color: 'from-indigo-500 to-purple-600' },
          { label: 'Model', value: 'llama3-70b-8192', desc: 'Current AI model in use', icon: Bot, color: 'from-purple-500 to-pink-500' },
          { label: 'Database', value: 'Supabase PostgreSQL', desc: 'Primary data store', icon: Database, color: 'from-green-500 to-emerald-500' },
          { label: 'Auth', value: 'Supabase Auth', desc: 'Authentication provider', icon: Shield, color: 'from-blue-500 to-cyan-500' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <GlassCard key={card.label} className="p-5">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/40">{card.label}</p>
                  <p className="font-semibold text-white">{card.value}</p>
                  <p className="text-xs text-white/30 mt-0.5">{card.desc}</p>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
