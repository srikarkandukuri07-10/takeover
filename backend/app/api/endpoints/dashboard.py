from fastapi import APIRouter
from app.db.database import get_supabase

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    supabase = get_supabase()
    result = {
        "total_employees": 0,
        "active_employees": 0,
        "open_positions": 0,
        "pending_approvals": 0,
        "recent_workflows": [],
        "departments": 0,
    }
    try:
        employees = supabase.table("employees").select("*").execute()
        result["total_employees"] = len(employees.data)
        result["active_employees"] = sum(1 for e in employees.data if e.get("status") == "active")
        result["departments"] = len(set(e.get("department", "Unknown") for e in employees.data))
    except Exception:
        pass
    try:
        jobs = supabase.table("jobs").select("*").execute()
        result["open_positions"] = sum(1 for j in jobs.data if j.get("status") == "open")
    except Exception:
        pass
    try:
        workflows = supabase.table("workflow_logs").select("*").order("created_at", desc=True).limit(5).execute()
        result["recent_workflows"] = workflows.data
    except Exception:
        pass
    try:
        pending = supabase.table("leave_requests").select("*").eq("status", "pending").execute()
        result["pending_approvals"] = len(pending.data)
    except Exception:
        pass
    return result
