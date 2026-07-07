from datetime import datetime
from app.db.database import get_supabase
import uuid


async def create_exit_checklist(employee_name: str = "", employee_id: str = "", last_working_day: str = ""):
    checklist = [
        {"task": "Knowledge Transfer", "assigned_to": "Employee", "status": "pending"},
        {"task": "Asset Return", "assigned_to": "IT Department", "status": "pending"},
        {"task": "Account Deactivation", "assigned_to": "IT Department", "status": "pending"},
        {"task": "Final Settlement", "assigned_to": "Finance", "status": "pending"},
        {"task": "Experience Letter", "assigned_to": "HR", "status": "pending"},
        {"task": "Exit Interview", "assigned_to": "HR", "status": "pending"},
    ]

    supabase = get_supabase()
    exit_id = str(uuid.uuid4())
    data = {
        "id": exit_id,
        "employee_id": employee_id,
        "employee_name": employee_name,
        "last_working_day": last_working_day,
        "checklist": checklist,
        "status": "initiated",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("exit_processes").insert(data).execute()

    return {
        "exit_id": exit_id,
        "employee": employee_name,
        "checklist": checklist,
        "status": "initiated"
    }


async def disable_accounts(employee_name: str = ""):
    accounts = ["Email", "Slack", "GitHub", "Jira", "Notion", "GSuite"]
    return {
        "employee": employee_name,
        "accounts_disabled": accounts,
        "status": "completed",
        "note": "All accounts have been deactivated"
    }


async def request_asset_return(employee_name: str = ""):
    assets = ["Laptop", "Monitor", "Keyboard", "Mouse", "ID Card", "Access Card"]
    return {
        "employee": employee_name,
        "assets": assets,
        "status": "requested",
        "return_deadline": "Within 7 working days"
    }


async def generate_experience_letter(employee_name: str = "", position: str = "", department: str = "", start_date: str = "", end_date: str = ""):
    letter = f"""
    EXPERIENCE LETTER
    
    This is to certify that {employee_name} worked with us as {position}
    in the {department} department from {start_date} to {end_date}.
    
    During their tenure, {employee_name} demonstrated excellent professionalism
    and made valuable contributions to the organization.
    
    We wish them the best in their future endeavors.
    
    Best regards,
    HR Department
    """
    return {
        "employee": employee_name,
        "position": position,
        "letter": letter.strip(),
        "status": "generated"
    }


async def initiate_recruitment(position: str = "", department: str = ""):
    supabase = get_supabase()
    job_id = str(uuid.uuid4())
    data = {
        "id": job_id,
        "title": position,
        "department": department,
        "status": "open",
        "description": f"Backfill position for {position}",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("jobs").insert(data).execute()

    return {
        "job_id": job_id,
        "position": position,
        "department": department,
        "status": "open",
        "note": "Recruitment initiated for backfill"
    }
