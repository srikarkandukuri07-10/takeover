from datetime import datetime
import uuid
from app.db.database import get_supabase
from app.utils.helpers import get_employee_uuid


async def verify_leave_balance(employee_id: str = "", leave_type: str = "annual", days_requested: int = 1):
    emp_uuid = await get_employee_uuid(employee_id)
    if not emp_uuid:
        raise ValueError(f"Employee '{employee_id}' not found in database")
        
    supabase = get_supabase()
    
    # Calculate balance from db
    remaining = 20
    try:
        res = supabase.table("leave_requests").select("id").eq("employee_id", emp_uuid).eq("status", "approved").execute()
        taken = len(res.data)
        remaining = 20 - taken
    except Exception:
        pass
        
    return {
        "employee_id": emp_uuid,
        "leave_type": leave_type,
        "remaining": remaining,
        "requested": days_requested,
        "sufficient": remaining >= days_requested
    }


async def check_team_availability(employee_id: str = "", start_date: str = "", end_date: str = ""):
    emp_uuid = await get_employee_uuid(employee_id)
    if not emp_uuid:
        raise ValueError(f"Employee '{employee_id}' not found in database")
        
    return {
        "employee_id": emp_uuid,
        "team_members": 8,
        "available": 6,
        "on_leave": 2,
        "feasible": True,
        "note": "Sufficient team members available to cover the absence"
    }


async def approve_leave(employee_id: str = "", leave_type: str = "", start_date: str = "", end_date: str = "", reason: str = ""):
    emp_uuid = await get_employee_uuid(employee_id)
    if not emp_uuid:
        raise ValueError(f"Employee '{employee_id}' not found in database")
        
    supabase = get_supabase()
    leave_id = str(uuid.uuid4())
    
    if not start_date:
        start_date = datetime.utcnow().date().isoformat()
    if not end_date:
        end_date = datetime.utcnow().date().isoformat()
        
    data = {
        "id": leave_id,
        "employee_id": emp_uuid,
        "leave_type": leave_type or "annual",
        "start_date": start_date,
        "end_date": end_date,
        "reason": reason or "Time off",
        "status": "approved",
        "approved_by": "AI_HR_Manager"
    }
    
    supabase.table("leave_requests").insert(data).execute()

    return {
        "leave_id": leave_id,
        "employee_id": emp_uuid,
        "status": "approved",
        "message": f"Leave approved from {start_date} to {end_date}"
    }


async def reject_leave(employee_id: str = "", reason: str = ""):
    emp_uuid = await get_employee_uuid(employee_id)
    if not emp_uuid:
        raise ValueError(f"Employee '{employee_id}' not found in database")
        
    return {
        "employee_id": emp_uuid,
        "status": "rejected",
        "reason": reason or "Insufficient leave balance or team availability",
        "message": "Leave request has been rejected"
    }


async def suggest_alternative_dates(employee_id: str = "", preferred_dates: list = None):
    if preferred_dates is None:
        preferred_dates = []
    return {
        "suggestions": [
            "Next week Monday to Wednesday",
            "Following week Thursday to Friday",
            "First week of next month"
        ],
        "message": "Suggested alternative dates that have better team availability"
    }

