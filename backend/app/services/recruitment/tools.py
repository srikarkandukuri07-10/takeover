from datetime import datetime
from app.db.database import get_supabase
import uuid


async def create_job_post(title: str = "", department: str = "", description: str = "", requirements: str = "", salary_range: str = "", location: str = ""):
    supabase = get_supabase()
    job_id = str(uuid.uuid4())
    data = {
        "id": job_id,
        "title": title,
        "department": department,
        "description": description,
        "requirements": requirements,
        "salary_range": salary_range or "Not specified",
        "location": location or "Remote",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("jobs").insert(data).execute()
    return {"job_id": job_id, "title": title, "status": "open"}


async def generate_job_description(position: str = "", department: str = "", skills: str = ""):
    return {
        "position": position,
        "department": department,
        "description": f"We are looking for a talented {position} to join our {department} team. "
                       f"The ideal candidate has experience with {skills}. "
                       f"This is an exciting opportunity to work on cutting-edge projects.",
        "requirements": f"- 3+ years of experience in {position}\n- Strong knowledge of {skills}\n- Excellent communication skills\n- Team player",
        "generated_at": datetime.utcnow().isoformat()
    }


async def rank_candidates(job_id: str = "", candidates: list = None):
    if candidates is None:
        candidates = []
    ranked = sorted(
        [{"name": c.get("name", ""), "score": c.get("score", 0), "skills": c.get("skills", [])} for c in candidates],
        key=lambda x: x["score"],
        reverse=True
    )
    return {"job_id": job_id, "ranked_candidates": ranked, "total": len(ranked)}


async def schedule_interview(candidate_name: str = "", position: str = "", date: str = "", time: str = "", interviewers: list = None):
    if interviewers is None:
        interviewers = ["Hiring Manager"]
    supabase = get_supabase()
    interview_id = str(uuid.uuid4())
    data = {
        "id": interview_id,
        "candidate_name": candidate_name,
        "position": position,
        "scheduled_date": date,
        "scheduled_time": time,
        "interviewers": interviewers,
        "status": "scheduled",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("interviews").insert(data).execute()
    return {"interview_id": interview_id, "candidate": candidate_name, "date": date, "status": "scheduled"}


async def generate_offer_letter(candidate_name: str = "", position: str = "", salary: str = "", start_date: str = ""):
    letter = f"""
    OFFER LETTER
    
    Dear {candidate_name},
    
    We are pleased to offer you the position of {position} at our company.
    
    Offer Details:
    - Position: {position}
    - Salary: {salary}
    - Start Date: {start_date}
    
    We look forward to having you on our team!
    
    Best regards,
    HR Department
    """
    return {
        "candidate": candidate_name,
        "position": position,
        "offer_letter": letter.strip(),
        "status": "generated"
    }
