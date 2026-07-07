'use client'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-white/70">{label}</label>
      )}
      <input
        className={cn(
          'w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white',
          'placeholder:text-white/30',
          'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20',
          'transition-all duration-200',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
