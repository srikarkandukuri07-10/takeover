from fastapi import APIRouter
from app.db.database import get_supabase

router = APIRouter(prefix="/api", tags=["hr_modules"])


def map_employee_details(records, employees):
    emp_map = {e["id"]: e for e in employees}
    result = []
    for r in records:
        record_copy = dict(r)
        emp_id = r.get("employee_id")
        if emp_id and emp_id in emp_map:
            record_copy["employee"] = emp_map[emp_id]
        else:
            record_copy["employee"] = None
            
        # If there's a mentor_id
        mentor_id = r.get("mentor_id")
        if mentor_id and mentor_id in emp_map:
            record_copy["mentor"] = emp_map[mentor_id]
            
        # If there's a reviewer_id
        reviewer_id = r.get("reviewer_id")
        if reviewer_id and reviewer_id in emp_map:
            record_copy["reviewer"] = emp_map[reviewer_id]
            
        result.append(record_copy)
    return result


@router.get("/onboarding")
async def get_onboarding_records():
    supabase = get_supabase()
    try:
        onboarding = supabase.table("onboarding").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id").execute()
        mapped = map_employee_details(onboarding.data, employees.data)
        return {"onboardings": mapped}
    except Exception as e:
        return {"onboardings": [], "error": str(e)}


@router.get("/leave")
async def get_leave_requests():
    supabase = get_supabase()
    try:
        leaves = supabase.table("leave_requests").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id").execute()
        mapped = map_employee_details(leaves.data, employees.data)
        return {"leaves": mapped}
    except Exception as e:
        return {"leaves": [], "error": str(e)}


@router.get("/training")
async def get_training_programs():
    supabase = get_supabase()
    try:
        trainings = supabase.table("training_programs").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id").execute()
        mapped = map_employee_details(trainings.data, employees.data)
        return {"trainings": mapped}
    except Exception as e:
        return {"trainings": [], "error": str(e)}


@router.get("/performance")
async def get_performance_reviews():
    supabase = get_supabase()
    try:
        reviews = supabase.table("performance_reviews").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id").execute()
        mapped = map_employee_details(reviews.data, employees.data)
        return {"reviews": mapped}
    except Exception as e:
        return {"reviews": [], "error": str(e)}


@router.get("/promotion")
async def get_promotions():
    supabase = get_supabase()
    try:
        promotions = supabase.table("promotions").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id", "salary").execute()
        mapped = map_employee_details(promotions.data, employees.data)
        return {"promotions": mapped}
    except Exception as e:
        return {"promotions": [], "error": str(e)}


@router.get("/payroll")
async def get_payroll_exceptions():
    supabase = get_supabase()
    try:
        exceptions = supabase.table("payroll_exceptions").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id").execute()
        mapped = map_employee_details(exceptions.data, employees.data)
        return {"exceptions": mapped}
    except Exception as e:
        return {"exceptions": [], "error": str(e)}


@router.get("/exit")
async def get_exit_processes():
    supabase = get_supabase()
    try:
        exits = supabase.table("exit_processes").select("*").order("created_at", desc=True).execute()
        employees = supabase.table("employees").select("id", "full_name", "position", "department", "employee_id").execute()
        mapped = map_employee_details(exits.data, employees.data)
        return {"exits": mapped}
    except Exception as e:
        return {"exits": [], "error": str(e)}


@router.post("/payroll/exception")
async def create_payroll_exception(data: dict):
    supabase = get_supabase()
    try:
        res = supabase.table("payroll_exceptions").insert(data).execute()
        return {"success": True, "data": res.data}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.put("/payroll/exception/{exception_id}")
async def update_payroll_exception(exception_id: str, data: dict):
    supabase = get_supabase()
    try:
        res = supabase.table("payroll_exceptions").update(data).eq("id", exception_id).execute()
        return {"success": True, "data": res.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

