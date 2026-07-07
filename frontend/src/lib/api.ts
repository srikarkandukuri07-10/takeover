const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Workflow
  executeWorkflow: (event: string) =>
    fetchAPI('/api/workflow/execute', {
      method: 'POST',
      body: JSON.stringify({ event }),
    }),

  getWorkflowHistory: (limit = 10) =>
    fetchAPI(`/api/workflow/history?limit=${limit}`),

  getWorkflow: (id: string) =>
    fetchAPI(`/api/workflow/${id}`),

  getLatestWorkflow: () =>
    fetchAPI('/api/workflow/status/latest'),

  // Dashboard
  getDashboardStats: () =>
    fetchAPI('/api/dashboard/stats'),

  // Employees
  getEmployees: (department?: string) =>
    fetchAPI(`/api/employees${department ? `?department=${department}` : ''}`),

  getEmployee: (id: string) =>
    fetchAPI(`/api/employees/${id}`),

  getEmployeeStats: () =>
    fetchAPI('/api/employees/stats/summary'),

  // Jobs
  getJobs: () =>
    fetchAPI('/api/jobs'),

  // HR Module Data
  getOnboardings: () =>
    fetchAPI('/api/onboarding'),

  getLeaveRequests: () =>
    fetchAPI('/api/leave'),

  getTrainingPrograms: () =>
    fetchAPI('/api/training'),

  getPerformanceReviews: () =>
    fetchAPI('/api/performance'),

  getPromotions: () =>
    fetchAPI('/api/promotion'),

  getPayrollExceptions: () =>
    fetchAPI('/api/payroll'),

  getExitProcesses: () =>
    fetchAPI('/api/exit'),

  createPayrollException: (data: any) =>
    fetchAPI('/api/payroll/exception', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updatePayrollException: (id: string, data: any) =>
    fetchAPI(`/api/payroll/exception/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
}


