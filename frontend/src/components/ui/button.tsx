'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  children,
  className,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25',
    secondary:
      'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]',
    ghost: 'hover:bg-white/[0.05] text-white/70 hover:text-white',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  )
}
