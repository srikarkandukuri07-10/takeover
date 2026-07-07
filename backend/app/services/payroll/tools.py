from datetime import datetime
import uuid
from app.db.database import get_supabase
from app.utils.helpers import get_employee_uuid


async def detect_salary_issue(employee_id: str = "", employee_name: str = "", issue_type: str = ""):
    emp_uuid = await get_employee_uuid(employee_id or employee_name)
    supabase = get_supabase()
    
    exception_id = None
    if emp_uuid:
        exception_id = str(uuid.uuid4())
        data = {
            "id": exception_id,
            "employee_id": emp_uuid,
            "issue_type": issue_type or "attendance_mismatch",
            "description": "Salary calculation discrepancy detected. Discrepancy between biometric log and CRM attendance tracker.",
            "severity": "medium",
            "adjustment_amount": 0.0,
            "status": "detected"
        }
        try:
            supabase.table("payroll_exceptions").insert(data).execute()
        except Exception:
            pass

    return {
        "exception_id": exception_id,
        "employee": employee_name or employee_id,
        "issue_type": issue_type or "attendance_mismatch",
        "severity": "medium",
        "description": "Salary calculation discrepancy detected",
        "detected_at": datetime.utcnow().isoformat()
    }


async def verify_attendance(employee_id: str = "", month: str = "", year: int = 2024):
    return {
        "employee_id": employee_id,
        "month": month,
        "year": year,
        "working_days": 22,
        "present_days": 20,
        "absent_days": 1,
        "leave_days": 1,
        "attendance_percentage": 95.5
    }


async def verify_leave(employee_id: str = "", month: str = "", year: int = 2024):
    return {
        "employee_id": employee_id,
        "month": month,
        "year": year,
        "leaves_taken": 1,
        "leaves_approved": 1,
        "leaves_unpaid": 0,
        "status": "verified"
    }


async def calculate_correction(employee_id: str = "", issue: str = "", adjustment_amount: float = 0):
    emp_uuid = await get_employee_uuid(employee_id)
    supabase = get_supabase()
    
    amt = adjustment_amount or 150.00
    if emp_uuid:
        try:
            res = supabase.table("payroll_exceptions").select("id").eq("employee_id", emp_uuid).order("created_at", desc=True).limit(1).execute()
            if res.data:
                ex_id = res.data[0]["id"]
                supabase.table("payroll_exceptions").update({
                    "adjustment_amount": amt,
                    "status": "resolved"
                }).eq("id", ex_id).execute()
        except Exception:
            pass

    return {
        "employee_id": employee_id,
        "correction_type": "salary_adjustment",
        "amount": amt,
        "reason": issue or "Biometric attendance mismatch resolved",
        "approved": True,
        "effective_next_payroll": True
    }

