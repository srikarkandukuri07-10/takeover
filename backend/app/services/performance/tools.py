from datetime import datetime
import uuid
from app.db.database import get_supabase
from app.utils.helpers import get_employee_uuid


async def collect_metrics(employee_id: str = "", period: str = "monthly"):
    return {
        "employee_id": employee_id,
        "period": period,
        "attendance": 95,
        "tasks_completed": 42,
        "projects_contributed": 3,
        "kpi_score": 4.2,
        "metrics": {
            "quality": 4.5,
            "productivity": 4.0,
            "teamwork": 4.3,
            "communication": 4.1
        }
    }


async def generate_review(employee_id: str = "", employee_name: str = "", position: str = ""):
    emp_uuid = await get_employee_uuid(employee_id or employee_name)
    reviewer_uuid = await get_employee_uuid("Sneha Gupta") # Seeded HR Manager
    supabase = get_supabase()
    
    review_id = None
    strengths = [
        "Strong technical problem-solving skills",
        "Excellent team collaboration",
        "Consistent delivery of high-quality work"
    ]
    weaknesses = [
        "Could improve documentation practices",
        "Should take more initiative in meetings"
    ]
    summary = f"{employee_name or 'Employee'} has shown solid performance this quarter. Consistently delivers quality work and collaborates well with the team. Focus areas for next quarter include documentation and proactive participation."

    if emp_uuid:
        review_id = str(uuid.uuid4())
        data = {
            "id": review_id,
            "employee_id": emp_uuid,
            "reviewer_id": reviewer_uuid,
            "period": "Last Quarter",
            "overall_rating": 4.20,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "summary": summary,
            "status": "draft"
        }
        try:
            supabase.table("performance_reviews").insert(data).execute()
        except Exception:
            pass

    return {
        "review_id": review_id,
        "employee": employee_name or "Employee",
        "position": position,
        "review_period": "Last Quarter",
        "overall_rating": 4.2,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "summary": summary,
        "status": "draft"
    }


async def recommend_improvements(employee_id: str = "", review_data: dict = None):
    if review_data is None:
        review_data = {}
    return {
        "recommendations": [
            "Enroll in technical writing workshop",
            "Lead at least one team presentation per quarter",
            "Mentor junior team members",
            "Complete advanced certification in relevant technologies"
        ],
        "priority": "medium",
        "timeline": "next quarter"
    }

