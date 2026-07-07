from datetime import datetime
from app.db.database import get_supabase
import uuid


async def create_employee(full_name: str = "", position: str = "", department: str = "", email: str = "", start_date: str = "", salary: str = ""):
    supabase = get_supabase()
    emp_id = str(uuid.uuid4())
    data = {
        "id": emp_id,
        "employee_id": f"EMP{datetime.utcnow().strftime('%Y%m')}{uuid.uuid4().hex[:4].upper()}",
        "full_name": full_name,
        "email": email,
        "position": position,
        "department": department,
        "salary": float(salary) if salary else 0,
        "status": "active",
        "start_date": start_date or datetime.utcnow().date().isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("employees").insert(data).execute()
    return {
        "employee_id": data["employee_id"],
        "full_name": full_name,
        "position": position,
        "department": department,
        "status": "active"
    }


async def assign_manager(employee_id: str = "", manager_name: str = ""):
    supabase = get_supabase()
    result = supabase.table("employees").select("*").eq("employee_id", employee_id).execute()
    employees = result.data
    if employees:
        manager_id = None
        mgr_result = supabase.table("employees").select("id").eq("full_name", manager_name).execute()
        if mgr_result.data:
            manager_id = mgr_result.data[0]["id"]

        supabase.table("employees").update({"manager_id": manager_id}).eq("id", employees[0]["id"]).execute()

    return {"employee_id": employee_id, "manager": manager_name, "status": "assigned"}


async def generate_company_email(full_name: str = ""):
    email = f"{full_name.lower().replace(' ', '.')}@company.com"
    return {"email": email, "status": "generated"}


async def create_employee_id(employee_id: str = ""):
    return {"employee_id": employee_id, "status": "created"}


async def allocate_laptop(employee_name: str = "", model: str = "MacBook Pro 14"):
    return {"employee": employee_name, "model": model, "serial": f"SN{uuid.uuid4().hex[:8].upper()}", "status": "allocated"}


async def schedule_orientation(employee_name: str = "", date: str = ""):
    orientation_date = date or datetime.utcnow().date().isoformat()
    return {
        "employee": employee_name,
        "date": orientation_date,
        "time": "09:00 AM",
        "duration": "4 hours",
        "status": "scheduled"
    }


async def assign_training(employee_name: str = "", position: str = ""):
    trainings = {
        "default": ["Company Culture & Values", "Safety Training", "IT Security Basics"],
        "engineer": ["Technical Onboarding", "Code Review Process", "CI/CD Pipeline"],
        "designer": ["Design System Overview", "Figma Workflow", "User Research Basics"],
        "manager": ["Leadership Training", "Performance Management", "Team Building"],
    }

    key = "default"
    for k in trainings:
        if k in position.lower():
            key = k
            break

    return {
        "employee": employee_name,
        "trainings": trainings[key],
        "status": "assigned"
    }
