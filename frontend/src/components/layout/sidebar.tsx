'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  ArrowUpCircle,
  DollarSign,
  DoorOpen,
  Settings,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Mission Control', icon: LayoutDashboard },
  { href: '/dashboard/employees', label: 'Employees', icon: Users },
  { href: '/dashboard/recruitment', label: 'Recruitment', icon: Briefcase },
  { href: '/dashboard/onboarding', label: 'Onboarding', icon: GraduationCap },
  { href: '/dashboard/leave', label: 'Leave', icon: CalendarCheck },
  { href: '/dashboard/training', label: 'Training', icon: TrendingUp },
  { href: '/dashboard/performance', label: 'Performance', icon: ArrowUpCircle },
  { href: '/dashboard/promotion', label: 'Promotion', icon: Sparkles },
  { href: '/dashboard/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/dashboard/exit', label: 'Exit', icon: DoorOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/[0.06] bg-black/50 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">
          AI HR Manager
        </span>
      </div>

      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold">
            AI
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">AI HR Manager</p>
            <p className="text-xs text-green-400">Online</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
