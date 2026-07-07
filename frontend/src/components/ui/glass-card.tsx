'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

export function GlassCard({ children, className, hover = false, delay = 0, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
