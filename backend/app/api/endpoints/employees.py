from fastapi import APIRouter, HTTPException
from app.db.database import get_supabase
from typing import Optional

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.get("")
async def get_employees(department: Optional[str] = None):
    supabase = get_supabase()
    query = supabase.table("employees").select("*")
    if department:
        query = query.eq("department", department)
    result = query.order("created_at", desc=True).execute()
    return {"employees": result.data}


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    supabase = get_supabase()
    result = supabase.table("employees").select("*").eq("id", employee_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"employee": result.data[0]}


@router.get("/stats/summary")
async def get_employee_stats():
    supabase = get_supabase()
    employees = supabase.table("employees").select("*").execute()
    total = len(employees.data)
    active = sum(1 for e in employees.data if e.get("status") == "active")
    departments = {}
    for e in employees.data:
        dept = e.get("department", "Unknown")
        departments[dept] = departments.get(dept, 0) + 1

    return {
        "total_employees": total,
        "active_employees": active,
        "departments": departments,
    }
