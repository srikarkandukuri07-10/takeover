export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'hr_admin' | 'manager' | 'employee'
  created_at?: string
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  module: string
  action: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  description?: string
  result?: any
  started_at?: string
  completed_at?: string
}

export interface Workflow {
  id: string
  event: string
  workflow_type?: string
  status: 'planning' | 'in_progress' | 'completed' | 'failed'
  steps: WorkflowStep[]
  summary?: string
  created_at?: string
  completed_at?: string
}

export interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  position: string
  department: string
  manager_id?: string
  manager_name?: string
  status: string
  salary?: number
  start_date?: string
  created_at?: string
}

export interface DashboardStats {
  total_employees: number
  active_employees: number
  open_positions: number
  pending_approvals: number
  recent_workflows: Workflow[]
  departments: number
}
