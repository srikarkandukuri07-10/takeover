from datetime import datetime
import uuid
from app.db.database import get_supabase
from app.utils.helpers import get_employee_uuid


async def generate_learning_plan(employee_name: str = "", position: str = "", skills: str = ""):
    emp_uuid = await get_employee_uuid(employee_name)
    supabase = get_supabase()
    
    plans = {
        "engineer": {
            "roadmap": [
                {"week": 1, "topic": "System Architecture & Design Patterns", "hours": 10},
                {"week": 2, "topic": "Advanced Programming Concepts", "hours": 10},
                {"week": 3, "topic": "Testing & Quality Assurance", "hours": 8},
                {"week": 4, "topic": "DevOps & Deployment", "hours": 8},
            ]
        }
    }
    key = "engineer" if "engineer" in position.lower() else "engineer"
    roadmap = plans[key]["roadmap"]
    
    program_id = None
    if emp_uuid:
        program_id = str(uuid.uuid4())
        data = {
            "id": program_id,
            "employee_id": emp_uuid,
            "program_name": f"{position} Onboarding Roadmap",
            "status": "assigned",
            "progress_percentage": 0,
            "start_date": datetime.utcnow().date().isoformat(),
        }
        try:
            supabase.table("training_programs").insert(data).execute()
        except Exception:
            pass
            
    return {
        "program_id": program_id,
        "employee_id": emp_uuid,
        "employee": employee_name,
        "position": position,
        "learning_plan": roadmap,
        "total_weeks": 4,
        "status": "assigned"
    }


async def assign_mentor(employee_name: str = "", mentor_name: str = ""):
    emp_uuid = await get_employee_uuid(employee_name)
    mentor_uuid = await get_employee_uuid(mentor_name or "Sneha Gupta")
    supabase = get_supabase()
    
    if emp_uuid:
        try:
            res = supabase.table("training_programs").select("id").eq("employee_id", emp_uuid).order("created_at", desc=True).limit(1).execute()
            if res.data:
                prog_id = res.data[0]["id"]
                supabase.table("training_programs").update({
                    "mentor_id": mentor_uuid,
                    "status": "in_progress",
                    "progress_percentage": 10
                }).eq("id", prog_id).execute()
        except Exception:
            pass
            
    return {
        "employee": employee_name,
        "mentor": mentor_name or "Sneha Gupta",
        "status": "in_progress"
    }


async def track_progress(employee_id: str = ""):
    emp_uuid = await get_employee_uuid(employee_id)
    supabase = get_supabase()
    
    progress = 50
    if emp_uuid:
        try:
            res = supabase.table("training_programs").select("id").eq("employee_id", emp_uuid).order("created_at", desc=True).limit(1).execute()
            if res.data:
                prog_id = res.data[0]["id"]
                supabase.table("training_programs").update({
                    "progress_percentage": progress,
                    "status": "in_progress"
                }).eq("id", prog_id).execute()
        except Exception:
            pass
            
    return {
        "employee_id": employee_id,
        "completed_modules": 2,
        "total_modules": 4,
        "progress_percentage": progress,
        "next_milestone": "Advanced Programming Concepts"
    }

