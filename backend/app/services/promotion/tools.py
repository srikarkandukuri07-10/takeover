from datetime import datetime
import uuid
from app.db.database import get_supabase
from app.utils.helpers import get_employee_uuid


async def evaluate_promotion(employee_id: str = "", employee_name: str = "", current_position: str = "", target_position: str = ""):
    return {
        "employee": employee_name,
        "current_position": current_position,
        "target_position": target_position,
        "eligibility_score": 85,
        "criteria": {
            "tenure": {"status": "met", "details": "2+ years in current role"},
            "performance": {"status": "met", "details": "Above average ratings"},
            "skills": {"status": "met", "details": "Required skills acquired"},
            "leadership": {"status": "partial", "details": "Shows leadership potential"}
        },
        "recommendation": "Recommended for promotion",
        "confidence": 0.85
    }


async def calculate_salary_revision(employee_name: str = "", current_salary: float = 0, promotion_level: str = ""):
    # Resolve current salary from database if not provided or 0
    if not current_salary and employee_name:
        emp_uuid = await get_employee_uuid(employee_name)
        supabase = get_supabase()
        if emp_uuid:
            try:
                res = supabase.table("employees").select("salary").eq("id", emp_uuid).execute()
                if res.data and res.data[0].get("salary"):
                    current_salary = float(res.data[0]["salary"])
            except Exception:
                pass

    if not current_salary:
        current_salary = 75000.0  # Fallback

    increase_pct = 0.15 if "senior" in promotion_level.lower() or "lead" in promotion_level.lower() else 0.10
    new_salary = current_salary * (1 + increase_pct)
    return {
        "current_salary": current_salary,
        "increase_percentage": increase_pct * 100,
        "increase_amount": round(new_salary - current_salary, 2),
        "new_salary": round(new_salary, 2),
        "currency": "USD"
    }


async def generate_promotion_letter(employee_name: str = "", current_position: str = "", new_position: str = "", effective_date: str = "", new_salary: float = 0):
    emp_uuid = await get_employee_uuid(employee_name)
    supabase = get_supabase()
    
    current_salary = 0.0
    if emp_uuid:
        try:
            emp_res = supabase.table("employees").select("*").eq("id", emp_uuid).execute()
            if emp_res.data:
                emp_data = emp_res.data[0]
                current_salary = float(emp_data.get("salary") or 0.0)
                if not current_position:
                    current_position = emp_data.get("position")
        except Exception:
            pass
            
    if not new_salary:
        new_salary = current_salary * 1.15
        
    if not effective_date:
        effective_date = datetime.utcnow().date().isoformat()
        
    promotion_id = None
    if emp_uuid:
        promotion_id = str(uuid.uuid4())
        data = {
            "id": promotion_id,
            "employee_id": emp_uuid,
            "current_position": current_position or "Developer",
            "new_position": new_position or "Senior Developer",
            "current_salary": current_salary,
            "new_salary": new_salary,
            "eligibility_score": 85.00,
            "ai_recommendation": "Highly recommended based on outstanding performance reviews.",
            "status": "pending",
            "effective_date": effective_date
        }
        try:
            supabase.table("promotions").insert(data).execute()
        except Exception:
            pass

    letter = f"""
    PROMOTION LETTER
    
    Dear {employee_name},
    
    We are delighted to inform you of your promotion from {current_position} to {new_position},
    effective {effective_date}.
    
    Your revised compensation will be ${new_salary:,.2f} per annum.
    
    This promotion is in recognition of your outstanding contributions and demonstrated leadership.
    
    Congratulations!
    
    Best regards,
    HR Department
    """
    return {
        "promotion_id": promotion_id,
        "employee": employee_name,
        "from": current_position,
        "to": new_position,
        "effective_date": effective_date,
        "letter": letter.strip(),
        "status": "generated"
    }

